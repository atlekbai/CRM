FROM tiangolo/uwsgi-nginx-flask:python3.7
# RUN echo http://mirror.yandex.ru/mirrors/alpine/v3.7/main > /etc/apk/repositories; \
    # echo http://mirror.yandex.ru/mirrors/alpine/v3.7/community >> /etc/apk/repositories

# RUN rm -rf /var/cache/apk/*
# RUN apk --update add bash nano
ENV STATIC_URL /static
ENV STATIC_PATH /var/www/app/static
COPY ./requirements.txt /var/www/requirements.txt
RUN pip install -r /var/www/requirements.txt