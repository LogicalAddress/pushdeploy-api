#!/bin/bash

# This scipt would be run as
# 1. root first time of execution most likely as stackscript
# 2. $HOST_USER subsequently

SCRIPT_DIR=`pwd`                  #TODO: This is so wrong
HOST_USER="pushdeploy"				#sudoer
LTS_NODE_VERSION="6.10.2"           # use LTS if NODE_VERSION is not set
PROJECT="pushdeploy"
GITHUB_REGEX="github"
BITBUCKET_REGEX="bitbucket"
GITLAB_REGEX="gitlab"
SUDO=''

# VARS TO BE EXPORTED: $ACTION (not used yet), $APP_NAME, $TEMPLATE, $CERT_TYPE, $NODE_VERSION
# $REPOSITORY, $PORT, $GITUSERNAME

export BRANCH="master"
export TEMPLATE="nodejs"
export CERT_TYPE="letsencrypt"
export REPOSITORY_TYPE="private" # default
export APP_GIT=$REPOSITORY
export BITBUCKET_ACCOUNT_NAME=$GITUSERNAME
export GITLABSERVER="gitlab.com" #if not exported uses gitlab.com by default

if [ `whoami` != "root" ]; then
    HOST_USER=`whoami`
fi

SUDO='echo "" | sudo -S'

# Called at the end of every function
function _return_to_script_dir {
    cd $SCRIPT_DIR #return to script dir
}

function _restart_nginx {
    eval $SUDO service nginx reload
    eval $SUDO service nginx restart
}

function add_mysql_database {
    # https://serversforhackers.com/c/installing-mysql-with-debconf
    which mysql
    if [ $? != 0 ]; then
        echo "installing mysql..."
        export DEBIAN_FRONTEND="noninteractive"
        eval $SUDO apt-get -y install debconf-utils
        echo "mysql-server-5.7 mysql-server/root_password password $DB_ROOT_PASSWORD" | sudo debconf-set-selections
        echo "mysql-server-5.7 mysql-server/root_password_again password $DB_ROOT_PASSWORD" | sudo debconf-set-selections
        sudo apt-get -y install mysql-server-5.7
        if [ $? != 0 ]; then
            echo "installing mysql...failed"
            exit 1
        fi
	fi
    # mysql -u root -password -e "use mysql; UPDATE user SET authentication_string=PASSWORD('$DB_ROOT_PASSWORD') WHERE User='root'; flush privileges;"
    mysql -u root -p$DB_ROOT_PASSWORD -e "create database $DB_NAME; GRANT ALL PRIVILEGES ON $DB_NAME.* TO $DB_USERNAME@localhost IDENTIFIED BY '$DB_PASSWORD'; FLUSH PRIVILEGES;"
    sudo service mysql restart
}

function notify_home_that_server_ready {
    local JSON=$( printf '{"type": "CREATE_SERVER_SUCCESS", "superuser": "%s", "server_id": "%s", "app_name": "%s", "port": "%s"}' "$HOST_USER" "$SERVER_ID" "$APP_NAME" "$PORT" )
    if [ -n "$CALLBACK_TOKEN" ]; then
        curl -X POST --header "Content-Type: application/json" --header "x-access-token: $CALLBACK_TOKEN" -d "$JSON" "$CALLBACK_URL"
    else
        curl -X POST --header "Content-Type: application/json" -d "$JSON" "$CALLBACK_URL"
    fi
}

function notify_home_that_app_added {
    local JSON=$( printf '{"type": "CREATE_APP_SUCCESS", "superuser": "%s", "server_id": "%s", "app_name": "%s", "port": "%s", "app_id": "%s"}' "$HOST_USER" "$SERVER_ID" "$APP_NAME" "$PORT" "$APP_ID")
    if [ -n "$CALLBACK_TOKEN" ]; then
        curl -X POST --header "Content-Type: application/json" --header "x-access-token: $CALLBACK_TOKEN" -d "$JSON" "$CALLBACK_URL"
    else
        curl -X POST --header "Content-Type: application/json" -d "$JSON" "$CALLBACK_URL"
    fi
}

function notify_home_that_app_deployed {
    local JSON=$( printf '{"type": "DEPLOY_APP_SUCCESS", "superuser": "%s", "server_id": "%s", "app_name": "%s", "app_id": "%s"}' "$HOST_USER" "$SERVER_ID" "$APP_NAME" "$APP_ID")
    if [ -n "$CALLBACK_TOKEN" ]; then
        curl -X POST --header "Content-Type: application/json" --header "x-access-token: $CALLBACK_TOKEN" -d "$JSON" "$CALLBACK_URL"
    else
        curl -X POST --header "Content-Type: application/json" -d "$JSON" "$CALLBACK_URL"
    fi
}

function _delete_ssl {
    certbot --nginx rollback --non-interactive -d $APP_NAME -d www.$APP_NAME
}

function _create_ssl {
    if [ "$CERT_TYPE" == "letsencrypt" ]; then
        which certbot
        if [ $? != 0 ]; then
    	    eval $SUDO add-apt-repository ppa:certbot/certbot -y
    	    eval $SUDO apt-get update -y
    	    eval $SUDO apt-get install python-certbot-nginx -y
    	fi
    	#eval $SUDO certbot --nginx -d $APP_NAME -d www.$APP_NAME
        eval $SUDO certbot --nginx --redirect --agree-tos --non-interactive --email $EMAIL -d $APP_NAME -d www.$APP_NAME
        # TODO: Create a Crontab to renew certificate at least ones a weak for those due
        if [ $? != 0 ]; then
            echo "Certbot Didn't Work"
            exit 1;
        fi
        return 0
    else
        echo "Invalid CERT_TYPE $CERT_TYPE"
        exit 1
    fi
}

function install_nginx {
    eval $SUDO apt-get install nginx -y
	eval $SUDO update-rc.d nginx defaults
    eval $SUDO rm /etc/nginx/sites-enabled/00-default 2> /dev/null
    eval $SUDO rm /etc/nginx/sites-enabled/default 2> /dev/null
    eval $SUDO rm /etc/nginx/sites-available/default 2> /dev/null
	return 0
}

function install_sshd {
    eval $SUDO apt install openssh-server -y
    return 0
}

# To be called for each app added, ignoring wheather we have previously added it or not
function upload_ssh_key {
    local KEY=$( cat /home/$HOST_USER/.ssh/id_rsa.pub )
    local TITLE=${KEY/* } # the '/* ' above deletes every character in $KEY up to and including the last space.
    if [ "$GIT_PROVIDER" == "github" ];
    then
        echo "Uploading key to github not neccessary any more. We got a token to handle to pull"
        # https://developer.github.com/v3/users/keys/#create-a-public-key
        # local JSON=$( printf '{"title": "%s", "key": "%s"}' "$SERVER_NAME" "$KEY" )
        # echo "Sending Key 1"
        # echo $JSON
        # curl -v -H "Authorization: token ${USER_OAUTH_TOKEN}" -H "Content-Type: application/json" -X POST -d "$JSON" "https://api.github.com/user/keys/"
        # # Upload Pushdeploy key if we havn't aleady done so while ignoring duplicate errors from git providers
        # if [ "$USERCARGOSPACEPUBKEY" != "" ]
        # then
        #     KEY=$USERCARGOSPACEPUBKEY
        #     TITLE="pushdeploy"
        #     JSON=$( printf '{"title": "%s", "key": "%s"}' "$SERVER_NAME" "$KEY" )
        #     echo "Sending key 2"
        #     echo $JSON
        #     curl -v -d "$JSON" "https://api.github.com/user/keys/?access_token=$USER_OAUTH_TOKEN"
        # else
        #     echo "USERCARGOSPACEPUBKEY env not set, proceeding without sending key to git provider.."
        # fi
    elif [ "$GIT_PROVIDER" == "bitbucket" ];
    then
        local data=$( printf -- '--data-urlencode "key=%s" --data-urlencode "label=%s" --data-urlencode "access_token=%s"' "$KEY" "$SERVER_NAME" "$USER_OAUTH_TOKEN" )
        curl -v $data "https://api.bitbucket.org/1.0/users/$BITBUCKET_ACCOUNT_NAME/ssh-keys"
        # Upload Pushdeploy key if we havn't aleady done so while ignoring duplicate errors from git providers
        if [ "$USERCARGOSPACEPUBKEY" != "" ]
        then
            KEY=$USERCARGOSPACEPUBKEY
            TITLE="pushdeploy"
            data=$( printf -- '--data-urlencode "key=%s" --data-urlencode "label=%s" --data-urlencode "access_token=%s"' "$KEY" "$SERVER_NAME" "$USER_OAUTH_TOKEN" )
            curl -v $data "https://api.bitbucket.org/1.0/users/$BITBUCKET_ACCOUNT_NAME/ssh-keys"
        else
            echo "USERCARGOSPACEPUBKEY env not set, proceeding without sending key to git provider.."
        fi
    elif [[ $APP_GIT =~ $GITLAB_REGEX ]];
    then
        local GITSERVER=''
        if [ "$GITLABSERVER" == "" ]
        then
           GITSERVER='gitlab.com'
        else
           GITSERVER=$GITLABSERVER
        fi
        local data=$( printf -- '--data-urlencode "key=%s" --data-urlencode "label=%s" --data-urlencode "private_token=%s"' "$KEY" "$SERVER_NAME" "$USER_OAUTH_TOKEN" )
        curl -v $data "https://$GITSERVER/api/v3/user/keys?private_token=$USER_OAUTH_TOKEN"
        # Upload Pushdeploy key if we havn't aleady done so while ignoring duplicate errors from git providers
        if [ "$USERCARGOSPACEPUBKEY" != "" ]
        then
            KEY=$USERCARGOSPACEPUBKEY
            TITLE="pushdeploy"
            data=$( printf -- '--data-urlencode "key=%s" --data-urlencode "label=%s" --data-urlencode "private_token=%s"' "$KEY" "$SERVER_NAME" "$USER_OAUTH_TOKEN" )
            curl -v $data "https://$GITSERVER/api/v3/user/keys?private_token=$USER_OAUTH_TOKEN"
        else
            echo "USERCARGOSPACEPUBKEY env not set, proceeding without sending key to git provider.."
        fi
    else
        echo "Project Hosting Not Supported"
        exit 1
    fi
}

function install_mongodb {
    echo "Installing mongodb server"
    #echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
    #sudo apt-get update -y
    sudo apt-get install -y mongodb
}

function create_user_and_project_directories {
    
    if [ `whoami` == "root" ]; then
        id -u $HOST_USER
        if [ $? != 0 ]; then
    	    eval $SUDO useradd --groups sudo,www-data --password="" --shell /bin/bash --user-group --create-home --home-dir /home/$HOST_USER $HOST_USER
            if [ $? != 0 ]; then
        	    echo "useradd failed"
        	    return 1
        	else
        	    echo "User $HOST_USER created"
                echo "Allow new User to run sudo without password"
                echo -e "$HOST_USER ALL=(ALL) NOPASSWD:ALL" | tee -a /etc/sudoers > /dev/null
        	fi
    	else
    	    echo "User previously created"
    	fi
	fi
	
	if [ ! -d "/home/$HOST_USER/.$PROJECT" ]; then
    	eval $SUDO mkdir -p /home/$HOST_USER/.$PROJECT
    	if [ $? != 0 ]; then
    	    echo "mkdir /home/$HOST_USER/.$PROJECT"
    	    return 1
    	else
    	    echo "mkdir /home/$HOST_USER/.$PROJECT"
    	fi
    else
        echo "/home/$HOST_USER/.$PROJECT Previously created"
    fi
    
    if [ ! -d "/usr/share/$PROJECT/startup_scripts" ]; then
    	eval $SUDO mkdir -p /usr/share/$PROJECT/startup_scripts
    	if [ $? != 0 ]; then
    	    echo "mkdir /usr/share/$PROJECT/startup_scripts"
    	    return 1
    	else
    	    echo "mkdir /usr/share/$PROJECT/startup_scripts"
    	fi
    else
        echo "/usr/share/$PROJECT/startup_scripts previously created"
    fi
    
    
	# Storage Path for CargSpace Files
	eval $SUDO chown -R $HOST_USER:$HOST_USER /home/$HOST_USER/.$PROJECT
	eval $SUDO chmod -R 777 /home/$HOST_USER/.$PROJECT
	eval $SUDO chown -R $HOST_USER:$HOST_USER /usr/share/$PROJECT/startup_scripts
	eval $SUDO chmod 777 /usr/share/$PROJECT/startup_scripts
	
	# Create Key-Pair for this user
	if [ ! -d "/home/$HOST_USER/.ssh" ]; then
	    eval $SUDO mkdir -p /home/$HOST_USER/.ssh
	    if [ $? != 0 ]; then
    	    echo "mkdir @ /home/$HOST_USER/.ssh failed"
    	    return 1
	    fi
	else
	    echo "/home/$HOST_USER/.ssh previous created"
	fi
	
	if [ ! -f "/home/$HOST_USER/.ssh/id_rsa" ]; then
	    eval $SUDO ssh-keygen -q -b 2048 -t rsa -f "/home/$HOST_USER/.ssh/id_rsa"
	    if [ $? != 0 ]; then
    	    echo "ssh generation at /home/$HOST_USER/.ssh/id_rsa failed"
    	    return 1
	    fi
	else
	    echo "/home/$HOST_USER/.ssh/id_rsa previous created"
	fi
	
	eval $SUDO chown -R $HOST_USER:$HOST_USER /home/$HOST_USER/.ssh
	# worker@cargospace.co's public key to be entered in /home/$HOST_USER/ssh/autoriz... from our nodejs server
	
	if [ "$USERCARGOSPACEPUBKEY" != "" ]
    then
        echo -e "# pushdeploy key\n$USERCARGOSPACEPUBKEY" | tee -a /home/$HOST_USER/.ssh/authorized_keys > /dev/null
    else
        echo "USERCARGOSPACEPUBKEY env not set, proceeding.."
    fi
	return 0
}

function deploy_logs {
    tail /home/$HOST_USER/.app_$APP_NAME.log.out -n 100 > /home/$HOST_USER/_tmp_app_$APP_NAME.log.out
    curl --header "x-access-token: $CALLBACK_TOKEN" \
  -F "type=DEPLOY_LOGS" \
  -F "server_id=$SERVER_ID" \
  -F "app_name=$APP_NAME" \
  -F "file=@/home/$HOST_USER/_tmp_app_$APP_NAME.log.out" \
  $CALLBACK_URL
  rm /home/$HOST_USER/_tmp_app_$APP_NAME.log.out
}

function server_logs {
    tail /home/$HOST_USER/.log.out -n 100 > /home/$HOST_USER/_tmp.log.out
    curl --header "x-access-token: $CALLBACK_TOKEN" \
  -F "type=SERVER_LOGS" \
  -F "server_id=$SERVER_ID" \
  -F "file=@/home/$HOST_USER/_tmp.log.out" \
  $CALLBACK_URL
  rm /home/$HOST_USER/_tmp.log.out
}

# create a user with super cow powers (First Time Execution)
function setup_server {
    echo "Setting up the machine with user $HOST_USER"
    eval $SUDO apt-get update -y
    eval $SUDO apt-get install curl python-pip git software-properties-common -y
	# todo: Copy public key to user's directory
	# if [ ! -f "/etc/ssl/certs/dhparam.pem" ]; then
	#     eval $SUDO openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
	# else
	#     echo "/etc/ssl/certs/dhparam.pem previously created"
	# fi
    return 0
}
##############NODEJS TEMPLATE########################
# Implement the hooks for other templates in v2
# All templates must implement this function too
function nodejs_create_app {
    
    if [ ! -f "/home/$HOST_USER/.$PROJECT/$APP_NAME.sh" ]; then
	    eval $SUDO touch /home/$HOST_USER/.$PROJECT/$APP_NAME.sh
	    if [ $? != 0 ]; then
	        echo "touch /home/$HOST_USER/.$PROJECT/$APP_NAME.sh failed"
	        return 1
	    fi
	else
	    echo "/home/$HOST_USER/.$PROJECT/$APP_NAME.sh previously created"
	fi
	
	if [ ! -f "/home/$HOST_USER/.$PROJECT/$APP_NAME.log" ]; then
	    eval $SUDO touch /home/$HOST_USER/.$PROJECT/$APP_NAME.log
	    if [ $? != 0 ]; then
	        echo "touch /home/$HOST_USER/.$PROJECT/$APP_NAME.log failed"
	        return 1
	    fi
	else
	    echo "/home/$HOST_USER/.$PROJECT/$APP_NAME.log previously created"
	fi
	
	if [ ! -d "/usr/share/$PROJECT/venv/$TEMPLATE" ]; then
	    eval $SUDO mkdir -p /usr/share/$PROJECT/venv/$TEMPLATE
	    if [ $? != 0 ]; then
    	    echo "mkdir @ /usr/share/$PROJECT/venv/$TEMPLATE failed"
    	    return 1
	    fi
	else
	    echo "/usr/share/$PROJECT/venv/$TEMPLATE previous created"
	fi
	
    eval $SUDO chmod +x /home/$HOST_USER/.$PROJECT/$APP_NAME.sh
    eval $SUDO chmod 777 /home/$HOST_USER/.$PROJECT/$APP_NAME.sh  # User exported variables
	eval $SUDO chown $HOST_USER:$HOST_USER /home/$HOST_USER/.$PROJECT/$APP_NAME.sh
	
	eval $SUDO chmod 777 /home/$HOST_USER/.$PROJECT/$APP_NAME.log
	eval $SUDO chown $HOST_USER:$HOST_USER /home/$HOST_USER/.$PROJECT/$APP_NAME.log
	eval $SUDO chown -R $HOST_USER:$HOST_USER /usr/share/$PROJECT/venv/$TEMPLATE
	eval $SUDO chmod -R 777 /usr/share/$PROJECT/venv/$TEMPLATE
}

function nodejs_app_is_running {
    eval $SUDO systemctl is-active $TEMPLATE-$APP_NAME.service
    if [ $? == 0 ]; then
        eval $SUDO systemctl status $TEMPLATE-$APP_NAME.service
	    exit 0
	fi
	eval $SUDO systemctl status $TEMPLATE-$APP_NAME.service
	exit 1
}

function nodejs_app_failed {
    eval $SUDO systemctl is-failed $TEMPLATE-$APP_NAME.service
    if [ $? == 0 ]; then
        eval $SUDO systemctl status $TEMPLATE-$APP_NAME.service
	    exit 0
	fi
	eval $SUDO systemctl status $TEMPLATE-$APP_NAME.service
	exit 1
}

# template_setup family of functions
function nodejs_app_setup {
    cd /usr/share/$PROJECT/venv/$TEMPLATE
    if [ `whoami` == "root" ]; then
        eval $SUDO -H -u $HOST_USER pip install nodeenv # apt install nodeenv doesnt work on ubuntu 16.04. node virtual environment manager
    else
        pip install nodeenv # apt install nodeenv doesnt work on ubuntu 16.04. node virtual environment manager
    fi
    
    if [ $? != 0 ]; then
	    echo "pip or apt install nodeenv manager failed"
	    return 1
	fi
    local VERSION=''
    if [ "$NODE_VERSION" == "" ]
    then
       VERSION=$LTS_NODE_VERSION
    else
       VERSION=$NODE_VERSION
    fi
    
    if [ ! -d "$APP_NAME" ]; then
        eval $SUDO -H -u $HOST_USER /home/$HOST_USER/.local/bin/nodeenv --node=$VERSION $APP_NAME # Every App with its virtual environment
        if [ $? != 0 ]; then
    	    echo "Setting up node environment for this user's selected configuration $TEMPLATE-$VERSION failed"
    	    return 1
    	fi
    	#TODO rm Last Line 
    	sed -i -n -e :a -e '1,1!{P;N;D;};N;ba' /usr/share/$PROJECT/venv/$TEMPLATE/$APP_NAME/bin/shim
    	echo -e "exec /usr/share/$PROJECT/venv/$TEMPLATE/$APP_NAME/bin/node \"\$@\"" | tee -a /usr/share/$PROJECT/venv/$TEMPLATE/$APP_NAME/bin/shim > /dev/null
    fi
        
    . $APP_NAME/bin/activate
    cd /home/$HOST_USER
    if [ ! -d "$APP_NAME" ]; then
        
        if [ "$REPO_VISIBILITY" == "private" ]; then
             if [ $GIT_PROVIDER == "github" ]; then
                # https://blog.github.com/2012-09-21-easier-builds-and-deployments-using-git-over-https-and-oauth/
                #################
                eval $SUDO -H -u $HOST_USER mkdir $APP_NAME
                cd $APP_NAME
                eval $SUDO -H -u $HOST_USER git init
                eval $SUDO -H -u $HOST_USER git pull https://$USER_OAUTH_TOKEN@github.com/$REPO_USER/$REPO_PROJECT_NAME.git
                if [ $? != 0 ]; then
            	    echo "cloning user repository failed. Did you set public key"
            	    return 1
        	    fi
        	    cd ..
        	    ##################
        	  elif [ $GIT_PROVIDER == "bitbucket" ]; then
        	        # https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html
                    # git clone $REPOSITORY $APP_NAME
                    #################
                    eval $SUDO -H -u $HOST_USER mkdir $APP_NAME
                    cd $APP_NAME
                    eval $SUDO -H -u $HOST_USER git init
                    eval $SUDO -H -u $HOST_USER git pull https://x-token-auth:$USER_OAUTH_TOKEN@bitbucket.org/$REPO_USER/$REPO_PROJECT_NAME.git
                    if [ $? != 0 ]; then
                        echo "cloning user repository failed. Did you set public key"
                        return 1
                    fi
                    cd ..
                    ##################
        	  else
        	        eval $SUDO -H -u $HOST_USER git clone $REPOSITORY $APP_NAME
        	  fi
	    else
	        eval $SUDO -H -u $HOST_USER git clone $REPOSITORY $APP_NAME #TODO Run this command as $HOST_USER
	    fi
	    cd $APP_NAME && eval $SUDO -H -u $HOST_USER git checkout $BRANCH
    else
        if [ "$REPO_VISIBILITY" == "private" ]; then
             if [ "$GIT_PROVIDER" == "github" ]; then
                cd $APP_NAME && eval $SUDO -H -u $HOST_USER git pull https://$USER_OAUTH_TOKEN@github.com/$REPO_USER/$REPO_PROJECT_NAME.git
             elif [ "$GIT_PROVIDER" == "bitbucket" ]; then
                cd $APP_NAME && eval $SUDO -H -u $HOST_USER git pull https://x-token-auth:$USER_OAUTH_TOKEN@bitbucket.org/$REPO_USER/$REPO_PROJECT_NAME.git
        	 else
        	     cd $APP_NAME && eval $SUDO -H -u $HOST_USER git pull origin $BRANCH
        	  fi
        else
            cd $APP_NAME && eval $SUDO -H -u $HOST_USER git pull origin $BRANCH
        fi
    fi
    
    npm install
    if [ $? != 0 ]; then
	    echo "npm install failed"
	    return 1
	fi
    # Get SERVER_ENTRY_POINT HERE
    startScript=$(node -p "require('/home/$HOST_USER/$APP_NAME/package.json').scripts.start")
    spaceStrip=${startScript##* }
    SERVER_ENTRY_POINT=${spaceStrip##*.\/}
    echo "SERVER_ENTRY_POINT found.."
    echo $SERVER_ENTRY_POINT
    deactivate_node
if [ ! -f "/usr/share/$PROJECT/startup_scripts/$APP_NAME.sh" ]; then    
echo -e "#!/bin/sh
# load user provided environment variable first, so we can overite bad onces.
. /home/$HOST_USER/.$PROJECT/$APP_NAME.sh
export PORT="$PORT"
export NODE_ENV='production'
export IP="0.0.0.0"
# Call node directly or use foreverjs
/usr/share/$PROJECT/venv/$TEMPLATE/$APP_NAME/bin/shim /home/$HOST_USER/$APP_NAME/$SERVER_ENTRY_POINT
" > /usr/share/$PROJECT/startup_scripts/$APP_NAME.sh && chmod 755 /usr/share/$PROJECT/startup_scripts/$APP_NAME.sh

    if [ $? != 0 ]; then
	    echo "creating shell file for systemd /usr/share/$PROJECT/startup_scripts/$APP_NAME.sh failed"
	    return 1
	fi
else
    echo "/usr/share/$PROJECT/startup_scripts/$APP_NAME.sh previously carried out"
fi

if [ ! -f "/lib/systemd/system/$TEMPLATE-$APP_NAME.service" ]; then   
echo -e "[Unit]
Description=$TEMPLATE-$APP_NAME Service
[Service]
ExecStart=/bin/sh -c '/usr/share/$PROJECT/startup_scripts/$APP_NAME.sh >> /home/$HOST_USER/.$PROJECT/$APP_NAME.log 2>&1'
Restart=on-failure
RestartSec=60s
[Install]
WantedBy=multi-user.target
" | sudo tee /lib/systemd/system/$TEMPLATE-$APP_NAME.service > /dev/null && eval $SUDO chmod 755 /lib/systemd/system/$TEMPLATE-$APP_NAME.service
    
    if [ $? != 0 ]; then
	    echo "creating systemd directive /lib/systemd/system/$TEMPLATE-$APP_NAME.service failed"
	    return 1
	fi
else
    echo "/lib/systemd/system/$TEMPLATE-$APP_NAME.service previously carried out"
fi	
    _return_to_script_dir
}

# template_deploy family of functions
function nodejs_deploy {
    echo "Deploying..."
    cd /home/$HOST_USER/$APP_NAME
    if [ "$REPO_VISIBILITY" == "private" ]; then
             if [ "$GIT_PROVIDER" == "github" ]; then
                eval $SUDO -H -u $HOST_USER git pull https://$USER_OAUTH_TOKEN@github.com/$REPO_USER/$REPO_PROJECT_NAME.git
             elif [ "$GIT_PROVIDER" == "bitbucket" ]; then
                eval $SUDO -H -u $HOST_USER git pull
                eval $SUDO -H -u $HOST_USER git checkout $APP_BRANCH #just incase
             else
                eval $SUDO -H -u $HOST_USER git pull
                eval $SUDO -H -u $HOST_USER git checkout $APP_BRANCH #just incase
             fi
    else
        eval $SUDO -H -u $HOST_USER git pull    
    fi
    eval $SUDO -H -u $HOST_USER git checkout $APP_BRANCH #just incase
    if [ $? != 0 ]; then
        echo "pulling changes.. failed"
	    exit 1
	fi
	. /usr/share/$PROJECT/venv/$TEMPLATE/$APP_NAME/bin/activate
    npm install
    if [ $? != 0 ]; then
        echo "npm install changes.. failed"
	    exit 1
	fi
    eval $SUDO systemctl is-enabled $TEMPLATE-$APP_NAME.service
    if [ $? == 0 ]; then
        echo "App already enabled"
        eval $SUDO systemctl is-active $TEMPLATE-$APP_NAME.service
        if [ $? == 0 ]; then
            echo "App is active, restarting the App.."
	        eval $SUDO systemctl restart $TEMPLATE-$APP_NAME.service
	    else
	        echo "App is not active, starting the App.."
	        eval $SUDO systemctl start $TEMPLATE-$APP_NAME.service        
	    fi
	else
	    echo "enabling and starting systemctl for this app"
	    eval $SUDO systemctl enable $TEMPLATE-$APP_NAME.service
        eval $SUDO systemctl start $TEMPLATE-$APP_NAME.service    
	fi
    _return_to_script_dir
}

# template_create_nginx_entry family of functions
function nodejs_create_nginx_entry {
    echo "nginx ...."
    local appConfig="/etc/nginx/sites-available/$APP_NAME"
    if [ ! -f "$appConfig" ]; then
        local SERVER_INFO=""
        if [ "$APP_NAME" == 'default' ]; then
            SERVER_INFO=`echo -e "
            listen 80 default_server;
            listen [::]:80 default_server;"`
            eval $SUDO touch /etc/nginx/sites-available/$APP_NAME
            eval $SUDO ln -s $appConfig /etc/nginx/sites-enabled/00-$APP_NAME
        else
            SERVER_INFO=`echo -e "
            listen 80;
            listen [::]:80;
            server_name $APP_NAME www.$APP_NAME;"`
            eval $SUDO touch /etc/nginx/sites-available/$APP_NAME
            eval $SUDO ln -s $appConfig /etc/nginx/sites-enabled/$APP_NAME
        fi
        
        echo -e "
        map \$http_upgrade \$connection_upgrade {
            default upgrade;
            '' close;
        }
        server{
            $SERVER_INFO
            
            access_log off;
            error_log  /var/log/nginx/$APP_NAME-error.log error;
        
            location / {
                proxy_pass http://0.0.0.0:$PORT;
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_http_version 1.1;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection \$connection_upgrade;
            }
        }
        " | sudo tee $appConfig > /dev/null
        
        _restart_nginx
    else
        echo "$appConfig previously done"
    fi
}

# template_add_nginx_entry_with_ssl family of functions
function nodejs_add_nginx_entry_with_ssl {
    # Redirect all http to https
    if [ "$APP_NAME" == 'default' ]; then
        exit 1 #Sorry, only for valid domain names ssl is allocated.
    fi
    _create_ssl
    _restart_nginx
}


# template_delete_nginx_entry_with_ssl family of functions
function nodejs_delete_nginx_entry_with_ssl {
    if [ "$APP_NAME" == 'default' ]; then
        exit 1 #Sorry, only for valid domain names ssl is allocated.
    fi
    _delete_ssl
    _restart_nginx
}
##############END NODEJS TEMPLATE########################


if [ $ACTION == 'init' ]; then
    # TODO: Validate Exported Variables
    setup_server
    if [ $? != 0 ]; then
        echo "setup_server failed"
	    exit 1
	fi
    install_nginx
    if [ $? != 0 ]; then
        echo "install_nginx failed"
	    exit 1
	fi
    install_sshd
    if [ $? != 0 ]; then
        echo "install_sshd failed"
	    exit 1
	fi
    create_user_and_project_directories
    if [ $? != 0 ]; then
        echo "create_user_and_project_directories failed"
	    exit 1
	fi
	notify_home_that_server_ready
	echo "init finished."
    exit 0
elif [ $ACTION == 'init_with_default_app' ]; then
    # TODO: Validate Exported Variables
    setup_server
    if [ $? != 0 ]; then
        echo "setup_server failed"
	    exit 1
	fi
    install_nginx
    if [ $? != 0 ]; then
        echo "install_nginx failed"
	    exit 1
	fi
    install_sshd
    if [ $? != 0 ]; then
        echo "install_sshd failed"
	    exit 1
	fi
    create_user_and_project_directories
    if [ $? != 0 ]; then
        echo "create_user_and_project_directories failed"
	    exit 1
	fi
    install_mongodb
    if [ $? != 0 ]; then
        echo "install_mongodb failed...continue regardless"
    fi
    ${TEMPLATE}_create_app
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_create_app failed"
	    exit 1
	fi
    ${TEMPLATE}_app_setup
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_app_setup failed"
	    exit 1
	fi
	${TEMPLATE}_create_nginx_entry
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_create_nginx_entry failed"
	    exit 1
	fi
	${TEMPLATE}_deploy
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_deploy failed"
	    exit 1
	fi
	notify_home_that_server_ready
    exit 0
elif [ $ACTION == 'add_app' ]; then
    # Check if app already exists and exit 1 with reason
    # Check if the chosen template is supported by script
    # Check if APP_NAME is set and that it matches a standard domain name
    ${TEMPLATE}_create_app
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_create_app failed"
	    exit 1
	fi
	
	echo $REPO_VISIBILITY;
	
	if [ "$REPO_VISIBILITY" == "private" ]; then
	    echo "upload_ssh_key running..."
	    upload_ssh_key
    else
        echo "Not uploading ssh key, app is probably a public repo"
	fi
	
    ${TEMPLATE}_app_setup
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_app_setup failed"
	    exit 1
	fi
	${TEMPLATE}_create_nginx_entry
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_create_nginx_entry failed"
	    exit 1
	fi
	
	${TEMPLATE}_deploy
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_deploy failed"
	    exit 1
	fi
	notify_home_that_app_added
    exit 0
elif [ $ACTION == 'deploy' ]; then
    # Check if template is set or fire an error. This shellscript doesn't remember and the server had better send a correct one
    # Check if APP_NAME is set and that it exists on the filesystem
    ${TEMPLATE}_deploy
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_deploy failed"
	    exit 1
	fi
	notify_home_that_app_deployed
    exit 0
elif [ $ACTION == 'server_logs' ]; then
    # Check if template is set or fire an error. This shellscript doesn't remember and the server had better send a correct one
    # Check if APP_NAME is set and that it exists on the filesystem
    server_logs
    if [ $? != 0 ]; then
        echo "server_logs failed"
	    exit 1
	fi
    exit 0
elif [ $ACTION == 'deploy_logs' ]; then
    # Check if template is set or fire an error. This shellscript doesn't remember and the server had better send a correct one
    # Check if APP_NAME is set and that it exists on the filesystem
    deploy_logs
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_deploy_logs failed"
	    exit 1
	fi
    exit 0
elif [ $ACTION == 'status' ]; then
    # TEMPLATE and APP_NAME is required
    ${TEMPLATE}_app_is_running
    exit 0
elif [ $ACTION == 'app_failed' ]; then
    # TEMPLATE and APP_NAME is required
    ${TEMPLATE}_app_failed
    exit 0
elif [ $ACTION == 'add_mysql_database' ]; then
    # TEMPLATE and APP_NAME is required
    add_mysql_database
    if [ $? != 0 ]; then
        echo "add_mysql_database failed"
	    exit 1
	fi
	JSON=$( printf '{"type": "CREATE_DATABASE_SUCCESS", "db_type": "mysql", "server_id": "%s", "db_name": "%s", "db_id": "%s"}' "$SERVER_ID" "$DB_NAME" "$DB_ID" )
    curl -X POST --header "Content-Type: application/json" -d "$JSON" "$CALLBACK_URL"
    exit 0
elif [ $ACTION == 'toggle_ssl' ]; then
    # TEMPLATE and APP_NAME is required
    if [ $TOGGLE_SSL == 'on' ]; then
        ${TEMPLATE}_add_nginx_entry_with_ssl
    else
        ${TEMPLATE}_delete_nginx_entry_with_ssl
	fi
    
    if [ $? != 0 ]; then
        echo "toggle_ssl failed"
	    exit 1
	fi
	JSON=$( printf '{"type": "TOGGLE_SSL_SUCCESS", "type": "letsencrypt", "server_id": "%s", "app_name": "%s", "app_id": "%s"}' "$SERVER_ID" "$APP_NAME" "$APP_ID" )
    curl -X POST --header "Content-Type: application/json" -d "$JSON" "$CALLBACK_URL"
    exit 0
else
    echo "Invalid Action Sent"
    exit 1
fi