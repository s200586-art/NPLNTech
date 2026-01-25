# NPLN Tech — Контекст для Claude Code

## Сервер

- **IP:** 89.104.65.27
- **Домен:** npln.tech
- **SSH:** `ssh root@89.104.65.27`
- **Web-сервер:** nginx
- **Путь к сайту:** `/var/www/nplntech`
- **SSL:** Let's Encrypt (автообновление через certbot)

## Локальные файлы

- **Репозиторий:** `/Users/s200586gmail.com/Documents/GitHub/NPLNTech`
- **GitHub:** `git@github.com:s200586-art/NPLNTech.git`

## Деплой

### Автоматический (каждые 5 минут)
На сервере настроен cron, который делает `git pull` каждые 5 минут.

### Ручной (мгновенный)
```bash
# Закоммитить и запушить
git add . && git commit -m "описание" && git push

# Принудительно обновить на сервере
ssh root@89.104.65.27 "cd /var/www/nplntech && git pull"
```

## Структура сайта

```
/var/www/nplntech/
├── index.html          # Главная страница
├── npln-pay.html       # Страница NPLN Pay бота
├── calculator.html     # Калькулятор
├── claims.html         # ПолПретензия PRO
├── napoleon/           # Проект "50 магазинов"
│   ├── index.html
│   ├── store-detail.html
│   ├── css/
│   ├── js/
│   ├── data/stores.json
│   └── images/
└── files/              # Статические файлы
```

## Nginx

### Конфигурация
```bash
# Просмотр
cat /etc/nginx/sites-available/nplntech

# Редактирование
nano /etc/nginx/sites-available/nplntech

# Проверка синтаксиса
nginx -t

# Перезагрузка
systemctl reload nginx
```

### Логи
```bash
# Access log
tail -f /var/log/nginx/nplntech_access.log

# Error log
tail -f /var/log/nginx/nplntech_error.log
```

## SSL/HTTPS

### Сертификат
- Путь: `/etc/letsencrypt/live/npln.tech/`
- Автообновление: настроено через certbot timer

### Обновить вручную
```bash
certbot renew
```

### Получить новый сертификат
```bash
certbot certonly --webroot -w /var/www/nplntech -d npln.tech --non-interactive --agree-tos --email admin@npln.tech
```

## Частые проблемы и решения

### 1. Сайт не открывается (ERR_CONNECTION_CLOSED)
**Причина:** Браузер пытается открыть HTTPS, а сертификата нет или nginx не настроен.

**Решение:**
```bash
# Проверить nginx
ssh root@89.104.65.27 "systemctl status nginx"

# Перезапустить
ssh root@89.104.65.27 "systemctl restart nginx"
```

### 2. Новый файл не появляется на сайте (404)
**Причины:**
- Файл не запушен в git
- Кэш на прокси (если используется)
- DNS кэш

**Решение:**
```bash
# Проверить что файл на сервере
ssh root@89.104.65.27 "ls -la /var/www/nplntech/имя_файла.html"

# Принудительно обновить
ssh root@89.104.65.27 "cd /var/www/nplntech && git pull"
```

### 3. DNS указывает на прокси reg.ru
**Симптом:** Сайт работает по IP, но не по домену.

**Проверка:**
```bash
dig +short npln.tech A
# Должно быть: 89.104.65.27
# Если другой IP — это прокси reg.ru
```

**Решение:** В панели reg.ru (ISPmanager) изменить A-запись на 89.104.65.27

### 4. Let's Encrypt не может получить сертификат
**Причины:**
- AAAA (IPv6) запись указывает на старый сервер
- DNS не обновился

**Проверка:**
```bash
dig +short npln.tech AAAA
# Должно быть пусто
```

**Решение:** Удалить AAAA-запись в DNS панели reg.ru, подождать 10-30 минут.

### 5. Изображения не загружаются в проекте napoleon
**Причина:** JavaScript добавляет `images/` к внешним URL.

**Решение:** В `js/app.js` и `js/store-detail.js` проверить:
```javascript
const imagePath = store.image.startsWith('http')
    ? store.image
    : `images/${store.image}`;
```

## Полезные команды

```bash
# Статус сервера
ssh root@89.104.65.27 "systemctl status nginx"

# Проверить доступность сайта
curl -sI https://npln.tech/

# Посмотреть последние логи
ssh root@89.104.65.27 "tail -20 /var/log/nginx/nplntech_access.log"

# Проверить DNS
dig +short npln.tech A
dig +short npln.tech AAAA

# Очистить кэш nginx (если настроен)
ssh root@89.104.65.27 "rm -rf /var/cache/nginx/* && systemctl reload nginx"

# Проверить место на диске
ssh root@89.104.65.27 "df -h"

# Проверить использование памяти
ssh root@89.104.65.27 "free -h"
```

## Контакты и ресурсы

- **Telegram:** https://t.me/npoleon
- **Хостинг:** reg.ru (ISPmanager: server58.hosting.reg.ru:1500)
- **GitHub:** https://github.com/s200586-art/NPLNTech

## Связанные проекты

- **50 магазинов напольных покрытий:** `/napoleon/`
- **Исходники:** `/Users/s200586gmail.com/Documents/50 flooring store/`
