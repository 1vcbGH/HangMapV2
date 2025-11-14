# 🌍 **HangMap V4 — Plataforma de Fiestas & Eventos (Full Release)**

HangMap V4 es una aplicación web completa para descubrir, crear y gestionar fiestas/eventos en tiempo real.
Incluye un **sistema de usuarios con invitación**, **rangos**, **panel administrativo**, **API REST**, **backend Node.js**, y una estructura simple lista para deploy en **Render**.

---

## 🗄️ **Estructura del Proyecto**

```
index.html
estilos.css
script.js
package.json

/server
    server.js
    users.json
    invitaciones.json
    fiestas.json

/admin
    admin.html
    dashboard.html
    admin.css
    admin.js
```

---

## 🔌 **API REST (Endpoints)**

### 🔐 Autenticación

**POST** `/api/users/register`
Registra un usuario nuevo usando un código de invitación.

**POST** `/api/users/login`
Devuelve token JWT + información del usuario.

---

### 🎉 Eventos

**GET** `/api/fiestas`
Obtiene lista de todos los eventos.

**POST** `/api/fiestas` *(requiere token)*
Crea un nuevo evento con:

```json
{
  "titulo": "Nombre",
  "descripcion": "Info del evento",
  "ubicacion": "Coordenadas o dirección",
  "...": "otros campos"
}
```

El backend añade:

```json
"creadoPor": "<usuario>",
"ts": "timestamp"
```

---

## 🖥️ **Panel Administrativo**

Ubicado en `/admin/` e incluye:

* Login administrativo (próxima versión visual)
* Dashboard inicial
* Archivos simples para extender roles y gestión

---

## 🚀 **Deploy en Render**

Usá esta configuración:

### ✔ Build Command:

```
npm install
```

### ✔ Start Command:

```
node server/server.js
```

### ✔ Root Directory:

*(vacío)*

---

## 🔐 **Tecnologías Utilizadas**

* Node.js + Express
* JSON como base de datos
* JWT para sesiones
* bcryptjs para cifrado
* HTML + CSS + JS vanilla
* Estructura simple y flexible

---

## 📌 **Próximas Funcionalidades (V5)**

* Mapa interactivo real con Leaflet
* Sistema completo de creación/edición de eventos visual
* Panel administrativo profesional
* Perfiles de usuarios
* Temas visuales
* Notificaciones
* PWA instalable
* Gestión avanzada de rangos

---

## 🧑‍💻 **Desarrollador**

@1vcbGH CEO & Fundador de BlackNova Development

https://github.com/1vcbGH https://1vcb.netlify.app/ https://dev.blacknova.cc/

---

## ⭐ Si te gustó, dejale una estrellita al repo


