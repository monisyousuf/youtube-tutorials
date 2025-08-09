# Simple WireMock server
FROM wiremock/wiremock:3.13.1
# Copy stub mappings and files
COPY mappings /home/wiremock/mappings
COPY __files /home/wiremock/__files