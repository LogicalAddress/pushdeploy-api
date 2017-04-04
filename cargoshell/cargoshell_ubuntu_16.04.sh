#!/bin/bash

SCRIPT_DIR=pwd                  #TODO: This is so wrong
GUSER="userspace"				#sudoer
LTS_NODE_VERSION="6.10.2"           # LTS


# Called at the end of every function
function _return_to_script_dir {
    cd $SCRIPT_DIR #return to script dir
}


function _install_nginx {
    apt-get install nginx
	update-rc.d nginx defaults
	rm /etc/nginx/sites-enabled/default 2> /dev/null
	ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
}

function _install_sshd {
    apt install openssh-server
}

function _create_user {
    useradd --groups sudo,www-data --password="" --shell /bin/bash --user-group --create-home --home-dir /home/$GUSER $GUSER
    if [ $? == 0 ]; then
	    echo "Successfully created user $GUSER"
	fi
	mkdir -p /home/$GUSER/.cargospace
	touch /home/$GUSER/.cargospace/$APP_NAME.sh
	touch /home/$GUSER/.cargospace/$APP_NAME.log
	mkdir -p /usr/share/cargospace/startups
	mkdir -p /usr/share/cargospace/venv/$TEMPLATE
	
	
	chmod +x /home/$GUSER/.cargospace/$APP_NAME.sh && chmod 777 /home/$GUSER/.cargospace/$APP_NAME.sh  # User exported variables
	chown $GUSER:$GUSER /home/$GUSER/.cargospace/$APP_NAME.sh
	
	chmod 777 /home/$GUSER/.cargospace/$APP_NAME.log
	chown $GUSER:$GUSER /home/$GUSER/.cargospace/$APP_NAME.log
	
	# Storage Path for CargSpace Files
	chown -R $GUSER:$GUSER /home/$GUSER/.cargospace && chmod -R 777 /home/$GUSER/.cargospace
	chown -R $GUSER:$GUSER /usr/share/cargospace/startups && chmod 777 /usr/share/cargospace/startups
	chown -R $GUSER:$GUSER /usr/share/cargospace/venv/$TEMPLATE && chmod 777 /usr/share/cargospace/venv/$TEMPLATE
	
	# Create Key-Pair for this user
	mkdir -p /home/$GUSER/.ssh && ssh-keygen -t rsa -C "$USER@`hostname`" -N "" -f /home/$GUSER/.ssh/id_rsa && chown -R $GUSER:$GUSER /home/$GUSER/.ssh
	# worker@cargospace.co's public key to be entered in /home/$GUSER/ssh/autoriz... from our nodejs server
}

function _create_ssl {
    if [ $CERT_TYPE == "letsencrypt" ]; then
        certbot certonly -d $APP_NAME -d www.$APP_NAME
        # TODO: Create a Crontab to renew certificate at least ones a weak for those due
        return $CERT_TYPE
    else
        echo "Invalid CERT_TYPE $CERT_TYPE"
        exit 1
    fi
}

# create a user with super cow powers (First Time Execution)
function setup_server {
    apt-get update
	# todo: Copy public key to user's directory
	_install_nginx
	_install_sshd
	openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
	_create_user
# 	echo "" | sudo -S service php5.6-fpm reload
}

function _restart_nginx {
    service nginx reload
    service nginx restart
}

# template_setup family of functions
function nodejs_setup {
    
    cd /usr/share/cargospace/venv/$TEMPLATE
    pip install nodeenv # install node virtual environment manager
    local VERSION=''
    if [ "$NODE_VERSION" = "" ]
    then
       VERSION=$LTS_NODE_VERSION
    else
       VERSION=$NODE_VERSION
    fi
    
    nodeenv --node=$VERSION $APP_NAME # Every App with its virtual environment
    . $APP_NAME/bin/activate
    cd /home/$GUSER && git clone $REPOSITORY $APP_NAME #TODO Run this command as $GUSER
    cd $APP_NAME && git checkout $BRANCH
    npm install
    deactivate_node
    
echo -e "#!/bin/sh
# load user provided environment variable first, so we can overite bad onces.
source /home/$GUSER/.cargospace/$APP_NAME.sh
export PORT="$PORT"
export IP="0.0.0.0"
# Call node directly or use foreverjs
/usr/share/cargospace/venv/$TEMPLATE/$APP_NAME/bin/shim /home/$GUSER/$APP_NAME/$SERVER_ENTRY_POINT
" > /usr/share/cargospace/startups/$APP_NAME.sh && chmod 755 /usr/share/cargospace/startups/$APP_NAME.sh

echo -e "[Unit]
Description=$TEMPLATE-$APP_NAME Service
[Service]
ExecStart=/bin/sh -c '/usr/share/cargospace/startups/$APP_NAME.sh >> /home/$GUSER/.cargospace/$APP_NAME.log 2>&1'
Restart=on-failure
RestartSec=60s
[Install]
WantedBy=multi-user.target
" > /lib/systemd/system/$TEMPLATE-$APP_NAME.service && chmod 755 /lib/systemd/system/$TEMPLATE-$APP_NAME.service

    systemctl enable $TEMPLATE-$APP_NAME.service
    systemctl start $TEMPLATE-$APP_NAME.service
    _return_to_script_dir
}

# template_deploy family of functions
function nodejs_deploy {
    cd $HOME
    cd $APP_NAME
    git pull
    _return_to_script_dir
}

# template_runserver family of functions
function nodejs_runserver {
    cd $HOME
    cd $APP_NAME
    git checkout $APP_BRANCH #just incase
    # TODO run or restart forever here
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
        touch /etc/nginx/sites-available/$APP_NAME
        ln -s $appConfig /etc/nginx/sites-enabled/$APP_NAME
    fi
    echo -e "
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
    " | cat - $appConfig > $tmpFile && mv $tmpFile $appConfig
    
    sed -i 's/\(#\) \(proxy_http_version\)/\2/' $appConfig
    sed -i 's/\(#\) \(proxy_set_header\)/\2/' $appConfig
    
    _restart_nginx
}

# template_delete_nginx_entry_for_socket family of functions
function nodejs_delete_nginx_entry_for_socket {
    local appConfig="/etc/nginx/sites-available/$APP_NAME"
    sed -i '1,9d' /etc/nginx/sites-available/$APP_NAME
    sed -i 's/\(proxy_http_version\)/# &/' $appConfig
    sed -i 's/\(proxy_set_header Upgrade\)/# &/' $appConfig
    sed -i 's/\(proxy_set_header Connection\)/# &/' $appConfig
    
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
    sed -i 's/listen 80/listen 443 ssl/' $appConfig # listen 443 ssl;
    sed -i 's/\(listen \[\:\:\]\:80\)/# &/' $appConfig # Comment out this line. Not Needed
    # sed -i "s/\(server_name\) \($APP_NAME\)/\1 \2 www.$APP_NAME/" $appConfig
    sed -i "s/# ssl_certificate;/ssl_certificate $sslCertificate;/" $appConfig
    sed -i "s/# ssl_certificate_key;/ssl_certificate_key $sslCertificateKey;/" $appConfig
    
    echo -e "
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
    sed -i 's/listen 443 ssl/listen 80/' $appConfig
    sed -i 's/\(#\) \(listen \[\:\:\]\:80\)/\2/' $appConfig
    sed -i 's/ssl_certificate \/.*$/ssl_certificate;/' $appConfig
    sed -i 's/ssl_certificate_key \/.*$/ssl_certificate_key;/' $appConfig
    # I obviously didn't cast the below spell
    # del last 7 lines http://www.unixguide.net/unix/sedoneliner.shtml
    # http://stackoverflow.com/questions/13380607/how-to-use-sed-to-remove-the-last-n-lines-of-a-file
    sed -i -n -e :a -e '1,7!{P;N;D;};N;ba' $appConfig
    
    _restart_nginx
}