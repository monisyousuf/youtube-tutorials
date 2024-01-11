FROM nginx:1.25.3
COPY index.html /usr/share/nginx/html
COPY style.css /usr/share/nginx/html
COPY *.js /usr/share/nginx/html