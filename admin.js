
function login(){
    let u = document.getElementById("user").value;
    let p = document.getElementById("pass").value;

    if(u === "HANGMAPADMIN" && p === "KzSzP4W12lx"){
        localStorage.setItem("admin","1");
        window.location = "dashboard.html";
    } else {
        document.getElementById("msg").innerText = "Credenciales incorrectas";
    }
}

function logout(){
    localStorage.removeItem("admin");
    window.location = "admin.html";
}

if(window.location.pathname.includes("dashboard")){
    if(!localStorage.getItem("admin")) window.location="admin.html";
    loadEvents();
}

function showSection(id){
    document.querySelectorAll(".section").forEach(s=>s.style.display="none");
    document.getElementById(id).style.display="block";
}

async function loadEvents(){
    try{
        let res = await fetch("/api/fiestas");
        let data = await res.json();
        document.getElementById("event-list").innerHTML =
            data.map(e=> `<div class='event-card'><b>${e.nombre}</b><br>${e.fecha}</div>`).join("");
        document.getElementById("stat-total").innerText = data.length;
    }catch(e){
        document.getElementById("event-list").innerText = "Error cargando eventos";
    }
}
