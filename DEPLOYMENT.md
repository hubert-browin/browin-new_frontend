# Wdrozenie na publiczny IP

Ta aplikacja jest przygotowana do wystawienia przez `nginx` na publicznym adresie `31.182.54.216`, z procesem Next.js uruchamianym jako usluga `systemd`.

## 1. Wymagania

- Ubuntu/Debian z uprawnieniami `root`
- Node.js `22 LTS` albo minimum `20.9.0`
- `nginx`
- otwarty port `80/tcp`

## 2. Instalacja pakietow na serwerze

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
node -v
npm -v
```

## 3. Wgranie aplikacji do katalogu produkcyjnego

```bash
sudo mkdir -p /var/www/browin
sudo chown -R hudzi:hudzi /var/www/browin
rsync -av --delete --exclude '.git' --exclude 'node_modules' --exclude '.next' /home/hudzi/browin/ /var/www/browin/
cd /var/www/browin
rm -rf node_modules
npm ci
npm run build
```

`node_modules` nie kopiujemy miedzy maszynami. W tym repo byly odtworzone z blednymi uprawnieniami, dlatego na serwerze trzeba je postawic od zera przez `npm ci`.

## 4. Zmienne srodowiskowe

Utworz plik `/etc/nowy-ecommerce.env`:

```bash
sudo tee /etc/nowy-ecommerce.env >/dev/null <<'EOF'
SITE_URL=http://31.182.54.216
EOF
```

Po podpieciu domeny zmien `SITE_URL` na docelowy adres, np. `https://sklep.browin.pl`.

## 5. Instalacja uslugi systemd

```bash
sudo cp /var/www/browin/deploy/systemd/nowy-ecommerce.service /etc/systemd/system/nowy-ecommerce.service
sudo systemctl daemon-reload
sudo systemctl enable --now nowy-ecommerce.service
sudo systemctl status nowy-ecommerce.service --no-pager
```

## 6. Instalacja konfiguracji nginx

```bash
sudo cp /var/www/browin/deploy/nginx/nowy-ecommerce.conf /etc/nginx/sites-available/nowy-ecommerce.conf
sudo ln -sf /etc/nginx/sites-available/nowy-ecommerce.conf /etc/nginx/sites-enabled/nowy-ecommerce.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw status
```

## 8. Kontrola po wdrozeniu

```bash
curl -I http://127.0.0.1:3000
curl -I http://127.0.0.1
curl -I http://31.182.54.216
```

Jesli usluga jest uruchomiona, mozesz potem korzystac z gotowego skryptu:

```bash
cd /var/www/browin
bash ./scripts/manage.sh deploy
```

Skrypt sam uzyje `sudo` do `systemctl` i `nginx`, wiec mozesz go odpalac z konta `hudzi`.

## 9. HTTPS

Na samym publicznym IP najprosciej wystawic aplikacje po HTTP. Jesli chcesz HTTPS, podepnij domene do serwera i dopiero wtedy wystaw certyfikat, np. przez `certbot`.
