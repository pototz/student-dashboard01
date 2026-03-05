// GLOBAL VARIABLES
let students = JSON.parse(localStorage.getItem("students")) || [];
let editIndex = null;
let scoreChart = null;

// UTILITY FUNCTIONS
function getRowColor(score) {
    if(score >= 80) return "rgba(0,200,0,0.3)";
    else if(score >= 50) return "rgba(255,206,86,0.3)";
    else return "rgba(255,99,132,0.3)";
}

function getBarColor(score){
    if(score >= 80) return "rgba(0,200,0,0.6)";
    else if(score >= 50) return "rgba(255,206,86,0.6)";
    else return "rgba(255,99,132,0.6)";
}

let lastTop1Score = null; // track previous top 1 globally

function checkNewTop1(data){
    if(data.length === 0) return;

    const topScores = [...data.map(s => s.score)].sort((a,b)=>b-a).slice(0,3);
    const newTop1Score = topScores[0];
    const newTop1Student = data.find(s => s.score === newTop1Score);

   if(lastTop1Score !== null && newTop1Score > lastTop1Score){
    showTop1Notification(newTop1Student.name);
    launchConfetti(); // 🎉 Confetti animation
}

    lastTop1Score = newTop1Score; // update lastTop1Score
}


// RENDER TABLE
function renderStudents(data){
    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";

    if(data.length === 0) return;
    
    // Top 3 scores dynamically
    const topScores = [...data.map(s => s.score)].sort((a,b)=>b-a).slice(0,3);

    data.forEach(student => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.score}</td>
            <td>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
            </td>
        `;
    if(topScores.includes(student.score)) {
    tr.style.backgroundColor = "rgba(0,150,255,0.3)"; // light blue
    tr.style.transition = "transform 0.3s, background-color 0.3s";
    tr.style.transform = "scale(1.05)";

    // Reset scale after animation
    setTimeout(() => {
        tr.style.transform = "scale(1)";
    }, 300);
} else {
    tr.style.backgroundColor = getRowColor(student.score);
}


        // Highlight top 3 in table
        if(topScores.includes(student.score)) {
            tr.style.backgroundColor = "rgba(0,150,255,0.3)"; // light blue
        } else {
            tr.style.backgroundColor = getRowColor(student.score);
        }

        tbody.appendChild(tr);

        tr.querySelector(".editBtn").onclick = () => editStudent(student);
        tr.querySelector(".deleteBtn").onclick = () => deleteStudent(student);
    });

    

    // Update chart dynamically
    updateChart(data);
    updateStatistics(data);
    checkNewTop1(data);
}




function updateChart(data){
    if(!scoreChart) return;

    const topScores = [...data.map(s => s.score)].sort((a,b)=>b-a).slice(0,3);

    scoreChart.data.labels = data.map(s => s.name);
    scoreChart.data.datasets[0].data = data.map(s => s.score);
    scoreChart.data.datasets[0].backgroundColor = data.map(s => {
        if(topScores.includes(s.score)) return "rgba(0,150,255,0.6)"; // top 3 light blue
        if(s.score >= 80) return "rgba(0,200,0,0.6)";
        if(s.score >= 50) return "rgba(255,206,86,0.6)";
        return "rgba(255,99,132,0.6)";
    });

    scoreChart.options.plugins.tooltip.callbacks.label = function(context){
        const name = context.label;
        const score = context.parsed.y;
        let rank = "";
        if(score === topScores[0]) rank = " (Top 1)";
        else if(score === topScores[1]) rank = " (Top 2)";
        else if(score === topScores[2]) rank = " (Top 3)";
        return `${name}: ${score} pts${rank}`;
    };

    scoreChart.update();

    scoreChart.data.datasets[0].backgroundColor = data.map(s => {
    if(topScores.includes(s.score)) {
        // animate by increasing opacity
        return "rgba(0,150,255,0.8)";
    }
    if(s.score >= 80) return "rgba(0,200,0,0.6)";
    if(s.score >= 50) return "rgba(255,206,86,0.6)";
    return "rgba(255,99,132,0.6)";
});
scoreChart.update();

}




// EDIT / DELETE FUNCTIONS
function editStudent(student){
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("score").value = student.score;
    editIndex = students.indexOf(student);
}

function deleteStudent(student){
    if(confirm("Delete this student?")){
        students.splice(students.indexOf(student),1);
        localStorage.setItem("students", JSON.stringify(students));
        renderStudents([...students]);
    }
}

// UPDATE CHART
function updateChart(data){
    if(!scoreChart) return;

    // Top 3 scores dynamically
    const topScores = [...data.map(s => s.score)].sort((a,b)=>b-a).slice(0,3);

    scoreChart.data.labels = data.map(s => s.name);
    scoreChart.data.datasets[0].data = data.map(s => s.score);
    scoreChart.data.datasets[0].backgroundColor = data.map(s => {
        if(topScores.includes(s.score)) return "rgba(0,150,255,0.6)"; // top 3 light blue
        if(s.score >= 80) return "rgba(0,200,0,0.6)";
        if(s.score >= 50) return "rgba(255,206,86,0.6)";
        return "rgba(255,99,132,0.6)";
    });

    // Update tooltip dynamically
    scoreChart.options.plugins.tooltip.callbacks.label = function(context){
        const name = context.label;
        const score = context.parsed.y;
        let rank = "";
        if(score === topScores[0]) rank = " (Top 1)";
        else if(score === topScores[1]) rank = " (Top 2)";
        else if(score === topScores[2]) rank = " (Top 3)";
        return `${name}: ${score} pts${rank}`;
    };

    scoreChart.update();
}

// UPDATE STATISTICS
function updateStatistics(data){
    const total = data.length;
    if(total === 0){
        document.getElementById("totalStudents").textContent = 0;
        document.getElementById("avgScore").textContent = 0;
        document.getElementById("highestScore").textContent = 0;
        document.getElementById("lowestScore").textContent = 0;
        document.getElementById("passRate").textContent = "0%";
        return;
    }

    const scores = data.map(s=>s.score);
    const sum = scores.reduce((a,b)=>a+b,0);
    const avg = (sum/total).toFixed(2);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passCount = scores.filter(s=>s>=50).length;
    const passRate = ((passCount/total)*100).toFixed(1) + "%";

    document.getElementById("totalStudents").textContent = total;
    document.getElementById("avgScore").textContent = avg;
    document.getElementById("highestScore").textContent = highest;
    document.getElementById("lowestScore").textContent = lowest;
    document.getElementById("passRate").textContent = passRate;
}

// EXPORT CSV
function exportCSV(){
    if(students.length === 0){ alert("No students to export!"); return; }
    const headers = ["Name","Email","Score"];
    const rows = students.map(s=>[s.name,s.email,s.score]);
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_dashboard.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// WINDOW ONLOAD
window.onload = function(){
    // INIT CHART
    const ctx = document.getElementById("scoreChart").getContext("2d");
    scoreChart = new Chart(ctx, {
        type: "bar",
        data: { labels: [], datasets:[{ label:"Scores", data:[], backgroundColor:[], borderWidth:1 }] },
        options: { responsive:true, scales:{ y:{ beginAtZero:true, max:100 } } }
    });

    renderStudents([...students]);

    // FORM SUBMIT
    document.getElementById("myForm").addEventListener("submit",function(e){
        e.preventDefault();
        let name = document.getElementById("name").value.trim();
        let email = document.getElementById("email").value.trim();
        let score = Number(document.getElementById("score").value.trim());

        if(!name || !email || isNaN(score) || score<0 || score>100){
            alert("Please enter valid Name, Email, and Score 0-100");
            return;
        }

        if(editIndex !== null){
            students[editIndex] = {name,email,score};
            editIndex = null;
        } else {
            students.push({name,email,score});
        }

        localStorage.setItem("students", JSON.stringify(students));
        renderStudents([...students]);

        document.getElementById("name").value="";
        document.getElementById("email").value="";
        document.getElementById("score").value="";
    });

    // SEARCH
    document.getElementById("searchInput").addEventListener("input",function(){
        const term = this.value.trim().toLowerCase();
        renderStudents(students.filter(s=>s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term)));
    });

    // RESET VIEW
    document.getElementById("filterAll").onclick = ()=> renderStudents([...students]);

    // SORT BUTTONS
    document.getElementById("sortHigh").onclick = ()=> renderStudents([...students].sort((a,b)=>b.score-a.score));
    document.getElementById("sortLow").onclick = ()=> renderStudents([...students].sort((a,b)=>a.score-b.score));

    // EXPORT CSV
    document.getElementById("exportCsv").onclick = exportCSV;

    // DARK MODE
    document.getElementById("darkModeBtn").onclick = ()=> document.body.classList.toggle("dark-mode");
};


function showTop1Notification(name){
    const notif = document.getElementById("top1Notification");
    notif.textContent = `🎉 New Top 1 Student: ${name}!`;
    notif.style.display = "block";
    notif.style.opacity = 0;
    notif.style.transition = "opacity 0.5s";

    // Fade in
    setTimeout(() => { notif.style.opacity = 1; }, 50);

    // Fade out after 3 seconds
    setTimeout(() => { notif.style.opacity = 0; }, 3000);
    setTimeout(() => { notif.style.display = "none"; }, 3500);
}


function launchConfetti(){
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiCount = 100;
    const confetti = [];

    for(let i=0;i<confettiCount;i++){
        confetti.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height - canvas.height,
            r: Math.random()*6 + 4,
            d: Math.random()*confettiCount,
            color: `hsl(${Math.random()*360}, 100%, 50%)`,
            tilt: Math.random()*10 - 10,
            tiltAngleIncrement: Math.random()*0.07 + 0.05
        });
    }

    let angle = 0;
    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        confetti.forEach((c, i)=>{
            ctx.beginPath();
            ctx.lineWidth = c.r/2;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + c.r/4, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r/4);
            ctx.stroke();
        });
        update();
    }

    function update(){
        angle += 0.01;
        confetti.forEach((c)=>{
            c.tiltAngle += c.tiltAngleIncrement;
            c.y += (Math.cos(angle + c.d) + 1 + c.r/2)/2;
            c.x += Math.sin(angle);
            c.tilt = Math.sin(c.tiltAngle) * 15;

            if(c.y > canvas.height){
                c.y = -10;
                c.x = Math.random()*canvas.width;
            }
        });
    }

    let animation = setInterval(draw, 20);

    // Stop confetti after 3 seconds
    setTimeout(()=>{
        clearInterval(animation);
        ctx.clearRect(0,0,canvas.width,canvas.height);
    }, 3000);
}

function applyTheme(theme){
    // Remove all previous theme classes
    document.body.classList.remove("light-theme","dark-theme","fun-theme");
    document.body.classList.add(theme + "-theme");

    // Update table rows colors dynamically
    const rows = document.querySelectorAll("#studentTable tbody tr");
    rows.forEach(tr => {
        const score = parseInt(tr.children[2].textContent);
        if(theme === "light"){
            tr.style.color = "#000";
            tr.style.backgroundColor = score >= 80 ? "rgba(0,200,0,0.3)" :
                                   score >= 50 ? "rgba(255,206,86,0.3)" :
                                   "rgba(255,99,132,0.3)";
        } else if(theme === "dark"){
            tr.style.color = "#fff";
            tr.style.backgroundColor = score >= 80 ? "rgba(0,200,0,0.5)" :
                                   score >= 50 ? "rgba(255,206,86,0.5)" :
                                   "rgba(255,99,132,0.5)";
        } else if(theme === "fun"){
            tr.style.color = "#000";
            tr.style.backgroundColor = score >= 80 ? "rgba(0,255,255,0.5)" :
                                   score >= 50 ? "rgba(255,0,255,0.5)" :
                                   "rgba(255,255,0,0.5)";
        }
    });

    // Optional: update chart colors for fun theme
    if(scoreChart){
        scoreChart.data.datasets[0].backgroundColor = Array.from(document.querySelectorAll("#studentTable tbody tr")).map(tr => tr.style.backgroundColor);
        scoreChart.update();
    }
}

const themeSelect = document.getElementById("themeSelect");

// Load saved theme
let savedTheme = localStorage.getItem("theme") || "light";
themeSelect.value = savedTheme;
applyTheme(savedTheme);

// On change
themeSelect.addEventListener("change", function(){
    const selected = this.value;
    applyTheme(selected);
    localStorage.setItem("theme", selected);
});
