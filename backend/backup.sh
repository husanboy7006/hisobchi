#!/bin/bash
# minimal_backup.sh - Hisobchi DB backup skripti

# Env Variables (Masalan: crontab ichiga qo'shish mumkin)
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-hisobchi}
DB_HOST=${DB_HOST:-db}  # localhost or docker container IP
TELEGRAM_BOT_TOKEN="BOT_TOKEN_NI_YOZING"
TELEGRAM_CHAT_ID="CHAT_ID_NI_YOZING"

DATE=$(date +"%Y-%m-%d_%H-%M")
BACKUP_FILENAME="${DB_NAME}_backup_${DATE}.sql.gz"
BACKUP_DIR="/tmp/hisobchi_backups"

mkdir -p "$BACKUP_DIR"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

echo "Starting backup for $DB_NAME..."

# Dump olish (baza Docker ichida ekanligini hisobga olib yozilgan, agar to'g'ridan to'g'ri VPS da bo'lsa `docker exec -t hisobchi_db` qismini olib tashlanadi)
PGPASSWORD=$DB_PASSWORD docker exec -t hisobchi_db pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_PATH"

if [ $? -eq 0 ]; then
    echo "Backup completed: $BACKUP_PATH"
    
    # Telegramga yuborish
    curl -s -F document=@"$BACKUP_PATH" "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument?chat_id=${TELEGRAM_CHAT_ID}&caption=Hisobchi DB Zaxira Nusxasi %23${DATE}"
    
    # 7 kundan iski backuplarni o'chirish (tozalab turish uchun)
    find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;
else
    echo "Backup failed!"
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=Hisobchi DB Zaxira nusxa yaratishda XATOLIK yuz berdi!"
fi

# CRONTAB UCHUN QO'LLANMA (Har kuni soat 03:00 da):
# 0 3 * * * /path/to/hisobchi/backup.sh >> /var/log/hisobchi_backup.log 2>&1

# RESTORE (QAYTA TIKLASH) KOMANDASI:
# gunzip -c hisobchi_backup_XXXX.sql.gz | docker exec -i hisobchi_db psql -U postgres -d hisobchi
