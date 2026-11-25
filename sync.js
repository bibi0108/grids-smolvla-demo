document.querySelectorAll(".sync").forEach((panel) => {
  const key = panel.dataset.trial;
  const video = document.getElementById("v-" + key);
  const canvas = panel.querySelector("canvas");
  const clock = panel.querySelector(".clock");
  const trace = traces[key];
  const context = canvas.getContext("2d");
  const duration = trace.extent / 30;
  let pending = 0;

  function draw() {
    const width = canvas.clientWidth;
    if (!panel.open || !width) return;
    const height = canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.scale(ratio, ratio);
    context.fillStyle = "#f5fafc";
    context.fillRect(0, 0, width, height);
    const x = (frame) => 34 + frame / trace.extent * (width - 48);
    const y = (value) => height - 25 - value / 100 * (height - 57);
    context.font = "12px system-ui";
    context.fillStyle = "#203e4b";
    context.fillText("gripper.pos (점)", 8, 15);
    [0, 25, 50, 75, 100].forEach((value) => {
      context.strokeStyle = "#cad8dd";
      context.beginPath();
      context.moveTo(x(0), y(value));
      context.lineTo(x(trace.extent), y(value));
      context.stroke();
      context.fillText(value, 5, y(value) + 4);
    });
    context.fillText("0초", x(0), height - 7);
    context.textAlign = "right";
    context.fillText(duration.toFixed(2) + "초", x(trace.extent), height - 7);
    context.textAlign = "center";
    trace.events.forEach(([frame], index) => {
      context.strokeStyle = "#a74f17";
      context.beginPath();
      context.moveTo(x(frame), y(100));
      context.lineTo(x(frame), y(0));
      context.stroke();
      context.fillStyle = "#874609";
      context.fillText(index + 1, x(frame), y(100) - 3);
    });
    context.strokeStyle = "#12526c";
    context.beginPath();
    trace.values.forEach((value, index) => {
      if (index === 0) context.moveTo(x(index), y(value));
      else context.lineTo(x(index), y(value));
    });
    context.stroke();
    const frame = Math.min(trace.n - 1, Math.floor(video.currentTime * 30 + 0.0001));
    context.strokeStyle = "#b42534";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x(frame), y(100));
    context.lineTo(x(frame), y(0));
    context.stroke();
    clock.textContent = video.currentTime.toFixed(2) + "초 · f" + frame + " · " + trace.values[frame].toFixed(2) + "점";
  }

  function tick() {
    pending = 0;
    draw();
    if (panel.open && !video.paused && !video.ended) pending = requestAnimationFrame(tick);
  }

  function update() {
    if (!pending) pending = requestAnimationFrame(tick);
  }
  ["play", "pause", "seeking", "seeked", "timeupdate", "loadedmetadata", "ended"].forEach((event) => {
    video.addEventListener(event, update);
  });
  panel.addEventListener("toggle", update);
  new ResizeObserver(update).observe(canvas);
  panel.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const time = Number(button.dataset.frame) / 30;
      if (video.readyState) video.currentTime = time;
      else {
        video.addEventListener("loadedmetadata", () => { video.currentTime = time; }, {once: true});
        video.load();
      }
      update();
    });
  });
});

