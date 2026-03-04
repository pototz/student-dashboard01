window.onload = function() {

    let students = JSON.parse(localStorage.getItem("students")) || [];
    let editIndex = null;

    const ctx = document.getElementById("scoreChart").getContext("2d");

    function getBarColor(score){
        const dark = document.body.classList.contains("dark-mode");
        if(dark){
            if(score >= 80) return "rgba(0,255,0,0.6)";
            if(score >= 50) return "rgba(255,255,0,0.6)";
            return "rgba(255,0,0,0.6)";
        } else {
            if(score >= 80) return "rgba(0,200,0,0.6)";
            if(score >= 50) return "rgba(255,206,86,0.6)";
            return "rgba(255,99,132,0.6)";
        }
    }

    function getRowColor(score){
        const dark = document.body.classList.contains("dark-mode");
        if(dark){
            if(score >= 80) return "#056608";
            if(score >= 50) return "#665500";
            return "#8b0000";
        } else {
            if(score >= 80) return "#d4edda";
            if(score >= 50) return "#fff3cd";
            return "#f8d7da";
        }
    }

    let scoreChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: students.map(s=>s.name),
            datasets: [{
                label: "Scores",
                data: students.map(s=>s.score),
                backgroundColor: students.map(s=>getBarColor(s.score)),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });

    function updateChart(){
        scoreChart.data.labels = students.map(s=>s.name);
        scoreChart.data.datasets[0].data = students.map(s=>s.score);
        scoreChart.data.datasets[0].backgroundColor = students.map(s=>getBarColor(s.score));
        scoreChart.update();
    }

    function renderStudents(){
        const tbody = document.querySelector("#studentTable tbody");
        tbody.innerHTML = "";

        students.forEach((student,index)=>{
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

            tr.style.backgroundColor = getRowColor(student.score);
            tbody.appendChild(tr);

            if(index === students.length-1){
                tr.style.transition = "background-color 0.8s";
                tr.style.backgroundColor = "#ffff99";
                setTimeout(()=>{
                    tr.style.backgroundColor = getRowColor(student.score);
                },800);
            }

            tr.querySelector(".editBtn").onclick = ()=>{
                document.getElementById("name").value = student.name;
                document.getElementById("email").value = student.email;
                document.getElementById("score").value = student.score;
                editIndex = index;
            };

            tr.querySelector(".deleteBtn").onclick = ()=>{
                if(confirm("Delete this student?")){
                    students.splice(index,1);
                    localStorage.setItem("students",JSON.stringify(students));
                    renderStudents();
                }
            };
        });

        updateChart();
    }

    renderStudents();

    document.getElementById("myForm").addEventListener("submit",function(e){
        e.preventDefault();

        let name = document.getElementById("name").value.trim();
        let email = document.getElementById("email").value.trim();
        let scoreInput = document.getElementById("score").value.trim();
        let score = Number(scoreInput);

        document.getElementById("nameError").textContent="";
        document.getElementById("emailError").textContent="";
        document.getElementById("scoreError").textContent="";
        document.getElementById("successMsg").textContent="";

        let error=false;

        if(!name){ document.getElementById("nameError").textContent="Name required"; error=true; }
        if(!email){ document.getElementById("emailError").textContent="Email required"; error=true; }
        else{
            let pattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!pattern.test(email)){
                document.getElementById("emailError").textContent="Invalid email";
                error=true;
            }
        }
        if(!scoreInput || isNaN(score) || score<0 || score>100){
            document.getElementById("scoreError").textContent="Score 0-100";
            error=true;
        }

        if(error) return;

        if(editIndex!==null){
            students[editIndex]={name,email,score};
            editIndex=null;
            document.getElementById("successMsg").textContent="Student updated ✅";
        } else {
            students.push({name,email,score});
            document.getElementById("successMsg").textContent="Student added ✅";
        }

        localStorage.setItem("students",JSON.stringify(students));
        renderStudents();

        document.getElementById("name").value="";
        document.getElementById("email").value="";
        document.getElementById("score").value="";
    });

    document.getElementById("darkModeBtn").onclick = ()=>{
        document.body.classList.toggle("dark-mode");
        renderStudents(); // re-render rows
    };

};
