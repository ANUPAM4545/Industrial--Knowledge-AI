const fs = require('fs');
const htmlPath = 'index.html';
let html = fs.readFileSync(htmlPath, 'utf-8');
const script = `
<script>
  window.addEventListener('error', function(event) {
    document.body.innerHTML += '<div style="color: red; padding: 20px; z-index: 9999; position: absolute; top: 0; left: 0; background: white; width: 100%; height: 100%;">' + event.error.stack + '</div>';
  });
  window.addEventListener('unhandledrejection', function(event) {
    document.body.innerHTML += '<div style="color: red; padding: 20px; z-index: 9999; position: absolute; top: 0; left: 0; background: white; width: 100%; height: 100%;">' + event.reason + '</div>';
  });
</script>
`;
if (!html.includes('window.addEventListener(\'error\'')) {
  html = html.replace('<head>', '<head>' + script);
  fs.writeFileSync(htmlPath, html);
}
