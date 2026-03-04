let students = [];
let chartInstance = null;
let passFailChartInstance = null;

// Load saved students
window.onload = function(){
    let data = localStorage.getItem("students");
    if(data){
        students = JSON.parse(data);
        renderStudents();
    }
}

// Render table, stats, charts
function renderStudents(listToRender = null){
    let tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";

    let arr = listToRender || students;

    arr.forEach((s, index)=>{
        let status="", color="";
        if(s.score>=90){status="⭐ Honors"; color="#3182ce";}
        else if(s.score>=75){status="PASS"; color="#38a169";}
        else{status="FAIL"; color="#e53e3e";}

        tbody.innerHTML += `<tr>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.score}</td>
            <td><span style="padding:4px 8px; color:white; background:${color}; border-radius:6px; font-weight:bold;">${status}</span></td>
            <td>
                <button onclick="editStudent(${index})">Edit</button>
                <button onclick="deleteStudent(${index})">Delete</button>
            </td>
        </tr>`;
    });

    updateStats();
    updateChart();
    updatePassFailChart();
}

// Form submit
document.getElementById("myForm").addEventListener("submit", function(event){
    event.preventDefault();
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let score = document.getElementById("score").value.trim();

    let hasError=false;
    document.getElementById("nameError").textContent="";
    document.getElementById("emailError").textContent="";
    document.getElementById("scoreError").textContent="";
    document.getElementById("successMsg").textContent="";

    if(name===""){document.getElementById("nameError").textContent="Name required"; hasError=true;}
    if(email===""){document.getElementById("emailError").textContent="Email required"; hasError=true;}
    else{let p=/^[^\s@]+@[^\s@]+\.[^\s@]+$/; if(!p.test(email)){document.getElementById("emailError").textContent="Invalid email"; hasError=true;}}
    let numScore=Number(score);
    if(score==="" || isNaN(numScore) || numScore<0 || numScore>100){document.getElementById("scoreError").textContent="0-100 only"; hasError=true;}

    if(hasError) return;

    students.push({name,email,score:numScore});
    localStorage.setItem("students", JSON.stringify(students));
    renderStudents();

    document.getElementById("successMsg").textContent="Submitted successfully ✅";
    document.getElementById("name").value="";
    document.getElementById("email").value="";
    document.getElementById("score").value="";
});

// Edit/Delete
function editStudent(index){
    let s=students[index];
    let n=prompt("Edit name:",s.name); if(n===null) return;
    let e=prompt("Edit email:",s.email); if(e===null) return;
    let sc=prompt("Edit score:",s.score); if(sc===null) return;
    n=n.trim(); e=e.trim(); sc=Number(sc);
    if(n===""||e===""||isNaN(sc)||sc<0||sc>100){alert("Invalid input"); return;}
    students[index]={name:n,email:e,score:sc};
    localStorage.setItem("students",JSON.stringify(students));
    renderStudents();
}

function deleteStudent(index){
    if(confirm("Delete this student?")){
        students.splice(index,1);
        localStorage.setItem("students",JSON.stringify(students));
        renderStudents();
    }
}

// Statistics
function updateStats(){
    if(students.length===0){
        document.getElementById("totalStudents").textContent=0;
        document.getElementById("avgScore").textContent=0;
        document.getElementById("highestScore").textContent=0;
        document.getElementById("lowestScore").textContent=0;
        return;
    }
    let total = students.length;
    let scores = students.map(s=>s.score);
    let sum = scores.reduce((a,b)=>a+b,0);
    let avg = (sum/total).toFixed(2);
    document.getElementById("totalStudents").textContent=total;
    document.getElementById("avgScore").textContent=avg;
    document.getElementById("highestScore").textContent=Math.max(...scores);
    document.getElementById("lowestScore").textContent=Math.min(...scores);
}

// Bar Chart (Scores + Average line)
function updateChart(){
    if(students.length===0) return;
    let names = students.map(s=>s.name);
    let scores = students.map(s=>Number(s.score));
    let average = scores.reduce((a,b)=>a+b,0)/scores.length;
    let colors = students.map(s=>s.score>=75?"#38a169":"#e53e3e");
    const ctx = document.getElementById("scoreChart").getContext("2d");

    if(chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx,{
        type:"bar",
        data:{
            labels:names,
            datasets:[
                {label:"Scores", data:scores, backgroundColor:colors},
                {label:"Average", data:Array(scores.length).fill(average), type:"line", borderColor:"red", borderWidth:2, fill:false}
            ]
        },
        options:{
            responsive:true,
            animation:{duration:1500, easing:'easeOutBounce'},
            scales:{y:{beginAtZero:true, max:100}}
        }
    });
}

// Pie Chart Pass/Fail
function updatePassFailChart(){
    if(students.length===0) return;
    let pass = students.filter(s=>s.score>=75).length;
    let fail = students.filter(s=>s.score<75).length;
    const ctx = document.getElementById("passFailChart").getContext("2d");

    if(passFailChartInstance) passFailChartInstance.destroy();

    passFailChartInstance = new Chart(ctx,{
        type:'pie',
        data:{
            labels:['PASS','FAIL'],
            datasets:[{data:[pass,fail], backgroundColor:['#38a169','#e53e3e']}]
        },
        options:{
            responsive:true,
            animation:{animateRotate:true, animateScale:true, duration:1500, easing:'easeOutCubic'}
        }
    });
}

// Search
document.getElementById("searchInput").addEventListener("input", function(){
    let q = this.value.toLowerCase();
    let filtered = students.filter(s=>s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    renderStudents(filtered);
});

// Export CSV
function exportCSV(){
    if(students.length===0){alert("No data"); return;}
    let csv = "Name,Email,Score\n";
    students.forEach(s=>{csv+=`${s.name},${s.email},${s.score}\n`;});
    let blob = new Blob([csv],{type:"text/csv"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a"); a.href=url; a.download="students.csv"; a.click();
    URL.revokeObjectURL(url);
}

// Backup & Restore
function backupData(){
    if(students.length===0){alert("No data to backup"); return;}
    let dataStr = JSON.stringify(students,null,2);
    let blob = new Blob([dataStr],{type:"application/json"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a"); a.href=url; a.download="students_backup.json"; a.click();
    URL.revokeObjectURL(url);
    alert("Backup completed ✅");
}

function restoreData(){
    let input = document.createElement("input"); input.type="file"; input.accept=".json";
    input.onchange = e=>{
        let file = e.target.files[0]; if(!file) return;
        let reader = new FileReader();
        reader.onload = event=>{
            try{
                let data = JSON.parse(event.target.result);
                if(!Array.isArray(data)){alert("Invalid file"); return;}
                students = data;
                localStorage.setItem("students", JSON.stringify(students));
                renderStudents();
                alert("Restore completed ✅");
            }catch(err){alert("Failed: "+err);}
        }
        reader.readAsText(file);
    }
    input.click();
}

// Dark Mode Toggle
document.getElementById("darkModeBtn").addEventListener("click", ()=>{
    document.body.classList.toggle("dark-mode");
});