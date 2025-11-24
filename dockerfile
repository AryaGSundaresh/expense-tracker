# Use NGINX to serve static website
FROM nginx:latest

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy your website files to NGINX public folder
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80
