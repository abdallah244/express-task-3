
window.addEventListener("DOMContentLoaded", () => {
  
  
  
  const API_URL = "/api/tasks";
  const TOKEN = "secret123";

  
  
  
  const yearEl = document.getElementById("year");
  const loaderEl = document.getElementById("loader");
  const typingEl = document.getElementById("typingText");
  const nav = document.getElementById("navbar");
  const canvas = document.getElementById("bgCanvas");
  const form = document.getElementById("taskForm");
  const input = document.getElementById("taskInput");
  const list = document.getElementById("taskList");
  const apiOutput = document.getElementById("apiOutput");
  const randomBtn = document.getElementById("randomTask");
  const copyBtn = document.getElementById("copyApi");

  
  
  
  function safeEl(el, fn) {
    if (el) fn(el);
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  
  
  
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  
  
  
  if (loaderEl) {
    
    setTimeout(() => {
      gsap.to(loaderEl, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => loaderEl.remove(),
      });
    }, 1400);
  }

  
  
  
  (function startTyping() {
    const text = "Organize your future with tasks.";
    let i = 0;
    if (!typingEl) return;
    (function typeChar() {
      if (i < text.length) {
        typingEl.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, 60);
      }
    })();
  })();

  
  
  
  if (nav) {
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 60) nav.classList.add("shrink");
        else nav.classList.remove("shrink");
      },
      { passive: true }
    );
    
    let navRevealed = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!navRevealed && window.scrollY > 10) {
          nav.classList.add("show");
          navRevealed = true;
        }
      },
      { once: true, passive: true }
    );
  }

  
  
  
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const particleCount = Math.max(40, Math.floor((W * H) / 60000)); 
    const particles = [];

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.8 + 0.6,
          dx: (Math.random() - 0.5) * (0.4 + Math.random() * 0.8),
          dy: (Math.random() - 0.5) * (0.4 + Math.random() * 0.8),
          hue: 260 + Math.random() * 60,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "rgba(12,8,30,0.15)");
      g.addColorStop(0.5, "rgba(40,30,80,0.06)");
      g.addColorStop(1, "rgba(12,8,30,0.12)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},85%,65%,0.12)`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},85%,60%,0.03)`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;
      }
      requestAnimationFrame(draw);
    }

    function onResize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initParticles();
    }
    window.addEventListener("resize", onResize);
    initParticles();
    draw();
  }

  
  
  
  const headline = document.querySelector(".headline");
  if (headline) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12; 
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      headline.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateZ(10px)`;
    });
  }

  
  
  
  async function fetchTasksAndRender() {
    try {
      const res = await fetch(API_URL);
      const tasks = await res.json();
      renderTasks(tasks);
      
      if (apiOutput) {
        apiOutput.innerHTML = syntaxHighlight(tasks);
        gsap.fromTo(
          apiOutput,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
        );
      }
    } catch (err) {
      if (apiOutput) apiOutput.textContent = "Error fetching tasks";
      console.error("fetchTasks error", err);
    }
  }

  function renderTasks(tasks) {
    if (!list) return;
    list.innerHTML = "";
    tasks.forEach((t) => {
      const li = document.createElement("li");
      li.className = "task-item";
      const titleSpan = document.createElement("span");
      titleSpan.textContent = `${t.title} ${t.completed ? "✅" : ""}`;
      const btn = document.createElement("button");
      btn.className = "btn ghost small deleteBtn";
      btn.textContent = "Delete";
      btn.addEventListener("click", async () => {
        try {
          await fetch(`${API_URL}/${t.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${TOKEN}` },
          });
          fetchTasksAndRender();
          gsap.to(li, {
            opacity: 0,
            y: -10,
            duration: 0.35,
            onComplete: () => li.remove(),
          });
        } catch (e) {
          console.error("delete error", e);
        }
      });
      li.appendChild(titleSpan);
      li.appendChild(btn);
      list.appendChild(li);
      gsap.from(li, { opacity: 0, y: 8, duration: 0.4, ease: "power2.out" });
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = (input.value || "").trim();
      if (!title) return;
      try {
        await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ title }),
        });
        input.value = "";
        await fetchTasksAndRender();
      } catch (err) {
        console.error("create task error", err);
      }
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", async () => {
      const samples = [
        "Read a book",
        "Go jogging",
        "Write code",
        "Learn GSAP",
        "Play music",
        "Cook dinner",
        "Study React",
      ];
      const title = samples[Math.floor(Math.random() * samples.length)];
      try {
        await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ title }),
        });
        await fetchTasksAndRender();
        
        gsap.fromTo(
          randomBtn,
          { scale: 1 },
          { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1 }
        );
      } catch (e) {
        console.error("random create error", e);
      }
    });
  }

  
  
  
  function syntaxHighlight(json) {
    if (typeof json !== "string") json = JSON.stringify(json, undefined, 2);
    json = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "number";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "key" : "string";
        } else if (/true|false/.test(match)) cls = "boolean";
        else if (/null/.test(match)) cls = "null";
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }

  
  
  
  if (copyBtn && apiOutput) {
    copyBtn.addEventListener("click", async () => {
      try {
        
        await navigator.clipboard.writeText(apiOutput.innerText);
        gsap.fromTo(
          copyBtn,
          { scale: 1 },
          {
            scale: 1.14,
            backgroundColor: "#7cffd4",
            duration: 0.22,
            yoyo: true,
            repeat: 1,
          }
        );
      } catch (e) {
        console.error("copy error", e);
      }
    });
  }

  
  
  
  fetchTasksAndRender();

  
  
  
  setTimeout(() => {
    if (input) input.focus();
  }, 1300);
});
