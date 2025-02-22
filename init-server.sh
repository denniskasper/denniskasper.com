#!/bin/bash -e

# Hint: Manually update and upgrade the systemn by running the following command: 
# sudo apt update && sudo apt upgrade -y && sudo reboot

# Prompt for the new username
read -p 'Enter the username for the new non-root user: ' new_user

# Add a non-root passwordless user
sudo adduser --disabled-password $new_user
sudo usermod -aG sudo $new_user

# Add the NOPASSWD directive for the new user to /etc/sudoers.d
echo "$new_user ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/$new_user > /dev/null

# Switch to the new user
su - $new_user

# Set up SSH key-based login for the new user
sudo mkdir -p /home/$new_user/.ssh

# Hint: To retrieve the SSH public key from your local machine, run:
# cat ~/.ssh/id_ed25519.pub
# Copy the output of this command and paste it when prompted below.
read -p "Enter the public SSH key for the new user: " ssh_key

echo "$ssh_key" | sudo tee /home/$new_user/.ssh/authorized_keys > /dev/null
sudo chmod 700 /home/$new_user/.ssh
sudo chmod 600 /home/$new_user/.ssh/authorized_keys
sudo chown -R $new_user:$new_user /home/$new_user/.ssh

# Secure SSH configuration
# sudo sed -i '/^PermitRootLogin/c\PermitRootLogin no' /etc/ssh/sshd_config
sudo sed -i '/^PasswordAuthentication/c\PasswordAuthentication no' /etc/ssh/sshd_config
sudo systemctl restart ssh

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
