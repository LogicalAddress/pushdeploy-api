#!/bin/bash

# This scipt would be run as
# 1. root first time of execution most likely as stackscript
# 2. $HOST_USER subsequently

SCRIPT_DIR=pwd                  #TODO: This is so wrong
HOST_USER="cargospace"				#sudoer
LTS_NODE_VERSION="6.10.2"           # use LTS if NODE_VERSION is not set
PROJECT="cargospace"
GITHUB_REGEX="github"
BITBUCKET_REGEX="bitbucket"
GITLAB_REGEX="gitlab"
SUDO=''

# VARS TO BE EXPORTED: $ACTION (not used yet), $APP_NAME, $TEMPLATE, $CERT_TYPE, $NODE_VERSION
# $REPOSITORY, $BRANCH, $PORT, $SERVER_ENTRY_POINT

export APP_NAME='default'
export TEMPLATE="nodejs"
export CERT_TYPE="letsencrypt"
export NODE_VERSION=""
export REPOSITORY=""
export REPOSITORY_TYPE="private" # default
export PORT="3000"
export SERVER_ENTRY_POINT="server.js"
export APP_GIT="git@github.com:CargoSpace/CargoSpaceChallenge.git"
export USER_OAUTH_TOKEN=""
export BITBUCKET_ACCOUNT_NAME=""
export GITLABSERVER="gitlab.com" #if not exported uses gitlab.com by default

if [ `whoami` == $HOST_USER ]; then
    SUDO='echo "" | sudo -S'
fi

# Called at the end of every function
function _return_to_script_dir {
    cd $SCRIPT_DIR #return to script dir
}

function _restart_nginx {
    eval $SUDO service nginx reload
    eval $SUDO service nginx restart
}

function _create_ssl {
    if [ $CERT_TYPE == "letsencrypt" ]; then
        eval $SUDO certbot certonly -d $APP_NAME -d www.$APP_NAME
        # TODO: Create a Crontab to renew certificate at least ones a weak for those due
        return $CERT_TYPE
    else
        echo "Invalid CERT_TYPE $CERT_TYPE"
        exit 1
    fi
}

function install_nginx {
    apt-get install nginx -y
	update-rc.d nginx defaults
	rm /etc/nginx/sites-enabled/default 2> /dev/null
	ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
	return 0
}

function install_sshd {
    apt install openssh-server -y
    return 0
}

# To be called for each app added, ignoring wheather we have previously added it or not
function upload_ssh_key {
    local KEY=$( cat /home/$HOST_USER/.ssh/id_rsa.pub )
    local TITLE=${KEY/* } # the '/* ' above deletes every character in $KEY up to and including the last space.
    if [[ $APP_GIT =~ $GITHUB_REGEX ]];
    then
        # https://developer.github.com/v3/users/keys/#create-a-public-key
        local JSON=$( printf '{"title": "%s", "key": "%s"}' "$TITLE" "$KEY" )
        curl -s -d "$JSON" "https://api.github.com/user/keys/?access_token=$USER_OAUTH_TOKEN"
        # Upload CargoSpace key if we havn't aleady done so while ignoring duplicate errors from git providers
        if [ "$USERCARGOSPACEPUBKEY" != "" ]
        then
            KEY=$USERCARGOSPACEPUBKEY
            TITLE="CargoSpace"
            JSON=$( printf '{"title": "%s", "key": "%s"}' "$TITLE" "$KEY" )
            curl -s -d "$JSON" "https://api.github.com/user/keys/?access_token=$USER_OAUTH_TOKEN"
        else
            echo "USERCARGOSPACEPUBKEY env not set, proceeding without sending key to git provider.."
        fi
    elif [[ $APP_GIT =~ $BITBUCKET_REGEX ]];
    then
        local data=$( printf -- '--data-urlencode "key=%s" --data-urlencode "label=%s" --data-urlencode "access_token=%s"' "$KEY" "$TITLE" "$USER_OAUTH_TOKEN" )
        curl -s $data "https://api.bitbucket.org/1.0/users/$BITBUCKET_ACCOUNT_NAME/ssh-keys"
        # Upload CargoSpace key if we havn't aleady done so while ignoring duplicate errors from git providers
        if [ "$USERCARGOSPACEPUBKEY" != "" ]
        then
            KEY=$USERCARGOSPACEPUBKEY
            TITLE="CargoSpace"
            data=$( printf -- '--data-urlencode "key=%s" --data-urlencode "label=%s" --data-urlencode "access_token=%s"' "$KEY" "$TITLE" "$USER_OAUTH_TOKEN" )
            curl -s $data "https://api.bitbucket.org/1.0/users/$BITBUCKET_ACCOUNT_NAME/ssh-keys"
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
        local data=$( printf -- '--data-urlencode "key=%s" --data-urlencode "label=%s" --data-urlencode "private_token=%s"' "$KEY" "$TITLE" "$USER_OAUTH_TOKEN" )
        curl -s $data "https://$GITSERVER/api/v3/user/keys?private_token=$USER_OAUTH_TOKEN"
        # Upload CargoSpace key if we havn't aleady done so while ignoring duplicate errors from git providers
        if [ "$USERCARGOSPACEPUBKEY" != "" ]
        then
            KEY=$USERCARGOSPACEPUBKEY
            TITLE="CargoSpace"
            data=$( printf -- '--data-urlencode "key=%s" --data-urlencode "label=%s" --data-urlencode "private_token=%s"' "$KEY" "$TITLE" "$USER_OAUTH_TOKEN" )
            curl -s $data "https://$GITSERVER/api/v3/user/keys?private_token=$USER_OAUTH_TOKEN"
        else
            echo "USERCARGOSPACEPUBKEY env not set, proceeding without sending key to git provider.."
        fi
    else
        echo "Project Hosting Not Supported"
        exit 1
    fi
}

function create_user_and_project_directories {
    useradd --groups sudo,www-data --password="" --shell /bin/bash --user-group --create-home --home-dir /home/$HOST_USER $HOST_USER
    if [ $? != 0 ]; then
	    echo "useradd failed"
	    return 1
	fi
	mkdir -p /home/$HOST_USER/.$PROJECT
	if [ $? != 0 ]; then
	    echo "mkdir /home/$HOST_USER/.$PROJECT"
	    return 1
	fi
	mkdir -p /usr/share/$PROJECT/startup_scripts
	if [ $? != 0 ]; then
	    echo "mkdir /usr/share/$PROJECT/startup_scripts"
	    return 1
	fi
	# Storage Path for CargSpace Files
	chown -R $HOST_USER:$HOST_USER /home/$HOST_USER/.$PROJECT && chmod -R 777 /home/$HOST_USER/.$PROJECT
	chown -R $HOST_USER:$HOST_USER /usr/share/$PROJECT/startup_scripts && chmod 777 /usr/share/$PROJECT/startup_scripts
	
	# Create Key-Pair for this user
	mkdir -p /home/$HOST_USER/.ssh && ssh-keygen -t rsa -C "$USER@`hostname`" -N "" -f /home/$HOST_USER/.ssh/id_rsa && chown -R $HOST_USER:$HOST_USER /home/$HOST_USER/.ssh
	# worker@cargospace.co's public key to be entered in /home/$HOST_USER/ssh/autoriz... from our nodejs server
	if [ $? != 0 ]; then
	    echo "mkdir and ssh generation at /home/$HOST_USER/.ssh failed"
	    return 1
	fi
	if [ "$USERCARGOSPACEPUBKEY" != "" ]
    then
        echo -e "# CargoSpace Key\n$USERCARGOSPACEPUBKEY" >> /home/$HOST_USER/.ssh/authorized_keys
    else
        echo "USERCARGOSPACEPUBKEY env not set, proceeding.."
    fi
	return 0
}

# create a user with super cow powers (First Time Execution)
function setup_server {
    apt-get update -y
    apt-get install curl -y
	# todo: Copy public key to user's directory
	openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
    # echo "" | sudo -S service php5.6-fpm reload
    return 0
}
##############NODEJS TEMPLATE########################
# Implement the hooks for other templates in v2
# All templates must implement this function too
function nodejs_create_app {
    touch /home/$HOST_USER/.$PROJECT/$APP_NAME.sh
    
    if [ $? != 0 ]; then
	    echo "touch /home/$HOST_USER/.$PROJECT/$APP_NAME.sh failed"
	    return 1
	fi
	
	touch /home/$HOST_USER/.$PROJECT/$APP_NAME.log
	eval $SUDO mkdir -p /usr/share/$PROJECT/venv/$TEMPLATE
	
	if [ $? != 0 ]; then
	    echo "mkdir /usr/share/$PROJECT/venv/$TEMPLATE failed"
	    return 1
	fi
	
	if [ $SUDO == '' ]; then
        chmod +x /home/$HOST_USER/.$PROJECT/$APP_NAME.sh && chmod 777 /home/$HOST_USER/.$PROJECT/$APP_NAME.sh  # User exported variables
    	chown $HOST_USER:$HOST_USER /home/$HOST_USER/.$PROJECT/$APP_NAME.sh
    	
    	chmod 777 /home/$HOST_USER/.$PROJECT/$APP_NAME.log
    	chown $HOST_USER:$HOST_USER /home/$HOST_USER/.$PROJECT/$APP_NAME.log
    	chown -R $HOST_USER:$HOST_USER /usr/share/$PROJECT/venv/$TEMPLATE && chmod -R 777 /usr/share/$PROJECT/venv/$TEMPLATE
    fi
}

function nodejs_app_is_running {
    eval $SUDO systemctl is-active $TEMPLATE-$APP_NAME.service
    if [ $? == 0 ]; then
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
	exit 1
}

# template_setup family of functions
function nodejs_app_setup {
    
    cd /usr/share/$PROJECT/venv/$TEMPLATE
    pip install nodeenv # apt install nodeenv doesnt work on ubuntu 16.04. node virtual environment manager
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
    
    nodeenv --node=$VERSION $APP_NAME # Every App with its virtual environment
    if [ $? != 0 ]; then
	    echo "Setting up node environment for this user's selected configuration $TEMPLATE-$VERSION failed"
	    return 1
	fi
    . $APP_NAME/bin/activate
    cd /home/$HOST_USER && git clone $REPOSITORY $APP_NAME #TODO Run this command as $HOST_USER
    if [ $? != 0 ]; then
	    echo "cloning user repository failed. Did you set public key"
	    return 1
	fi
    cd $APP_NAME && git checkout $BRANCH
    npm install
    if [ $? != 0 ]; then
	    echo "npm install failed"
	    return 1
	fi
    deactivate_node
    
echo -e "#!/bin/sh
# load user provided environment variable first, so we can overite bad onces.
source /home/$HOST_USER/.$PROJECT/$APP_NAME.sh
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

eval $SUDO echo -e "[Unit]
Description=$TEMPLATE-$APP_NAME Service
[Service]
ExecStart=/bin/sh -c '/usr/share/$PROJECT/startup_scripts/$APP_NAME.sh >> /home/$HOST_USER/.$PROJECT/$APP_NAME.log 2>&1'
Restart=on-failure
RestartSec=60s
[Install]
WantedBy=multi-user.target
" > /lib/systemd/system/$TEMPLATE-$APP_NAME.service && eval $SUDO chmod 755 /lib/systemd/system/$TEMPLATE-$APP_NAME.service
    
    if [ $? != 0 ]; then
	    echo "creating systemd directive /lib/systemd/system/$TEMPLATE-$APP_NAME.service failed"
	    return 1
	fi
	
    _return_to_script_dir
}

# template_deploy family of functions
function nodejs_deploy {
    cd /home/$HOST_USER/$APP_NAME
    git pull
    git checkout $APP_BRANCH #just incase
    if [ $? != 0 ]; then
        echo "pulling changes.. failed"
	    exit 1
	fi
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
	        eval $SUDO systemctl reload-or-restart $TEMPLATE-$APP_NAME.service
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
    local appConfig="/etc/nginx/sites-available/$APP_NAME"
    local SERVER_INFO=""
    if [ $APP_NAME == 'default' ]; then
        SERVER_INFO=`echo -e "
        listen 80 default_server;
        listen [::]:80 default_server;"`
    else
        SERVER_INFO=`echo -e "
        listen 80;
        listen [::]:80;
        server_name $APP_NAME www.$APP_NAME;"`
        eval $SUDO touch /etc/nginx/sites-available/$APP_NAME
        eval $SUDO ln -s $appConfig /etc/nginx/sites-enabled/$APP_NAME
    fi
    eval $SUDO echo -e "
    server{
        $SERVER_INFO
    
        # CargoSpace SSL (DO NOT REMOVE!)
        # ssl_certificate;
        # ssl_certificate_key;
    
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_prefer_server_ciphers on;
        ssl_dhparam /etc/ssl/certs/dhparam.pem;
        ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_stapling on;
        ssl_stapling_verify on;
        add_header Strict-Transport-Security max-age=15768000;
    
        
        access_log off;
        error_log  /var/log/nginx/$APP_NAME-error.log error;
    
    
        location / {
            proxy_pass http://0.0.0.0:$PORT;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            # CargoSpace Socket (DO NOT REMOVE!)
            # proxy_http_version 1.1;
            # proxy_set_header Upgrade \$http_upgrade;
            # proxy_set_header Connection \$connection_upgrade;
        }
    }
    " > $appConfig
    
    _restart_nginx
}

# template_add_nginx_entry_for_socket family of functions
function nodejs_add_nginx_entry_for_socket {
    local tmpFile="/etc/nginx/sites-available/qtmp"
    local appConfig="/etc/nginx/sites-available/$APP_NAME"
    echo -e "
    map \$http_upgrade \$connection_upgrade {
        default upgrade;
        '' close;
    }
    upstream websocket {
        server 0.0.0.0:$PORT;
    }
    " | eval $SUDO cat - $appConfig > $tmpFile && eval $SUDO mv $tmpFile $appConfig
    
    eval $SUDO sed -i 's/\(#\) \(proxy_http_version\)/\2/' $appConfig
    eval $SUDO sed -i 's/\(#\) \(proxy_set_header\)/\2/' $appConfig
    
    _restart_nginx
}

# template_delete_nginx_entry_for_socket family of functions
function nodejs_delete_nginx_entry_for_socket {
    local appConfig="/etc/nginx/sites-available/$APP_NAME"
    eval $SUDO sed -i '1,9d' /etc/nginx/sites-available/$APP_NAME
    eval $SUDO sed -i 's/\(proxy_http_version\)/# &/' $appConfig
    eval $SUDO sed -i 's/\(proxy_set_header Upgrade\)/# &/' $appConfig
    eval $SUDO sed -i 's/\(proxy_set_header Connection\)/# &/' $appConfig
    
    _restart_nginx
}

# template_add_nginx_entry_with_ssl family of functions
function nodejs_add_nginx_entry_with_ssl {
    # Redirect all http to https
    local appConfig="/etc/nginx/sites-available/$APP_NAME"
    if [ $APP_NAME == 'default' ]; then
        exit 1 #Sorry, only for valid domain names ssl is allocated.
    fi
    # listen 443 ssl;
    # server_name cargospace.ng www.cargospace.ng;
    # ssl_certificate /etc/letsencrypt/live/cargospace.ng/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/cargospace.ng/privkey.pem;
    local sslCertificate=''
    local $sslCertificateKey=''
    _create_ssl
    if [ $CERT_TYPE == "letsencrypt" ]; then
        sslCertificate="/etc/letsencrypt/live/$APP_NAME/fullchain.pem;"
        $sslCertificateKey="/etc/letsencrypt/live/$APP_NAME/privkey.pem;"
    fi
    eval $SUDO sed -i 's/listen 80/listen 443 ssl/' $appConfig # listen 443 ssl;
    eval $SUDO sed -i 's/\(listen \[\:\:\]\:80\)/# &/' $appConfig # Comment out this line. Not Needed
    # sed -i "s/\(server_name\) \($APP_NAME\)/\1 \2 www.$APP_NAME/" $appConfig
    eval $SUDO sed -i "s/# ssl_certificate;/ssl_certificate $sslCertificate;/" $appConfig
    eval $SUDO sed -i "s/# ssl_certificate_key;/ssl_certificate_key $sslCertificateKey;/" $appConfig
    
    eval $SUDO echo -e "
    server {
        listen 80;
        server_name $APP_NAME www.$APP_NAME;
        return 301 https://\$host\$request_uri;
    }
    " >> $appConfig
    
    _restart_nginx
}


# template_delete_nginx_entry_with_ssl family of functions
function nodejs_delete_nginx_entry_with_ssl {
    local appConfig="/etc/nginx/sites-available/$APP_NAME"
    eval $SUDO sed -i 's/listen 443 ssl/listen 80/' $appConfig
    eval $SUDO sed -i 's/\(#\) \(listen \[\:\:\]\:80\)/\2/' $appConfig
    eval $SUDO sed -i 's/ssl_certificate \/.*$/ssl_certificate;/' $appConfig
    eval $SUDO sed -i 's/ssl_certificate_key \/.*$/ssl_certificate_key;/' $appConfig
    # I obviously didn't cast the below spell
    # del last 7 lines http://www.unixguide.net/unix/sedoneliner.shtml
    # http://stackoverflow.com/questions/13380607/how-to-use-sed-to-remove-the-last-n-lines-of-a-file
    eval $SUDO sed -i -n -e :a -e '1,7!{P;N;D;};N;ba' $appConfig
    
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
    ${TEMPLATE}_app_setup
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_app_setup failed"
	    exit 1
	fi
    exit 0
elif [ $ACTION == 'deploy' ]; then
    # Check if template is set or fire an error. This shellscript doesn't remember and the server had better send a correct one
    # Check if APP_NAME is set and that it exists on the filesystem
    ${TEMPLATE}_deploy
    if [ $? != 0 ]; then
        echo "${TEMPLATE}_deploy failed"
	    exit 1
	fi
    exit 0
elif [ $ACTION == 'status' ]; then
    # TEMPLATE and APP_NAME is required
    ${TEMPLATE}_app_is_running
elif [ $ACTION == 'app_failed' ]; then
    # TEMPLATE and APP_NAME is required
    ${TEMPLATE}_app_failed
else
    echo "Invalid Action Sent"
    exit 1
fi