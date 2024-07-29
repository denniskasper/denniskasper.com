#!/bin/bash

# Hint: Manually update and upgrade the systemn by running the following command: 
# sudo apt update && sudo apt upgrade -y && sudo reboot

# Install necessary packages
sudo apt install -y curl nginx snapd ufw nano

# Configure UFW firewall
sudo ufw enable
sudo ufw allow "Nginx Full"
sudo ufw allow "OpenSSH"
sudo ufw status

# Install Certbot using snap
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Create necessary directories and set permissions
sudo mkdir -p /var/www/denniskasper.com/html
sudo chown -R $USER:$USER /var/www/denniskasper.com/html
sudo chmod -R 755 /var/www/denniskasper.com

# Create a sample HTML file
sudo tee /var/www/denniskasper.com/html/index.html > /dev/null <<EOF
<html>
<head>
    <title>Welcome to DennisKasper.com!</title>
</head>
<body>
    <h1>Success! The DennisKasper.com server block is working!</h1>
</body>
</html>
EOF

# Configure Nginx server block
sudo bash -c 'cat > /etc/nginx/sites-available/denniskasper.com <<EOF
server {
    listen 80;
    listen [::]:80;

    root /var/www/denniskasper.com/html;
    index index.html;

    server_name denniskasper.com www.denniskasper.com;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF'

# Enable the server block
sudo ln -s /etc/nginx/sites-available/denniskasper.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtain SSL certificate using Certbot
sudo certbot --nginx -d denniskasper.com -d www.denniskasper.com

# Check Certbot renewal status
sudo systemctl status snap.certbot.renew.service

# Test Nginx configuration and restart
sudo nginx -t
sudo systemctl restart nginx

echo "Setup complete!"
