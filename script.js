const systemInfo = `
<span class="neofetch-art">
<span style="font-family: monospace; white-space: pre;">

OS: Browser Linux 
Host: ${navigator.userAgent.split(')')[0].split('(')[1]}  
Kernel: 5.15.0-88-generic 
Shell: web-terminal 1.0 
CPU: ${navigator.hardwareConcurrency} cores 
RAM: ~${Math.round((performance.deviceMemory || 4) * 1024)} MB (estimated) 
Resolution: ${screen.width}x${screen.height} 
GPU: ${(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).split('/')[0] : 'Unknown';
    } catch(e) { return 'Unknown'; }
  })()}


</span>`;

let matrixInterval = null;
let currentTheme = localStorage.getItem('terminalTheme') || 'default';

function saveTheme(themeName) {
    localStorage.setItem('terminalTheme', themeName);
}

const colorThemes = {
    default: {
        bg: '#1a1b26',
        fg: '#bda9d6',
        accent: '#bd7af7',
        error: '#f7768e',
        matrix: '#bd7af7'
    },
    bw: {
        bg: '#ffffff',
        fg: '#000000',
        accent: '#555555',
        error: '#888888',
        matrix: '#555555'
    },
    red: {
        bg: '#2a0f0f',
        fg: '#ffcccc',
        accent: '#ff5555',
        error: '#ff0000',
        matrix: '#ff5555'
    },
    blue: {
        bg: '#0f1a2a',
        fg: '#cce0ff',
        accent: '#5588ff',
        error: '#0066ff',
        matrix: '#5588ff'
    },
    green: {
        bg: '#0f2a12',
        fg: '#ccffd6',
        accent: '#55ff77',
        error: '#00ff44',
        matrix: '#55ff77'
    }
};

function applyTheme(themeName) {
    const theme = colorThemes[themeName];
    currentTheme = themeName;
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--fg', theme.fg);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--error', theme.error);
    
    saveTheme(themeName);
    
    if (matrixInterval) {
        document.querySelectorAll('.matrix-digit').forEach(el => {
            el.style.color = theme.matrix;
        });
    }
}

const commands = {
    help: `<span style="font-family: monospace; white-space: pre;">
┌──────────────────┬──────────────────────────────────────┐
│ <span class="accent">command</span>          │ <span class="accent">description</span>                          │
├──────────────────┼──────────────────────────────────────┤
│ neofetch         │ Show system information              │
│ clear            │ Clear terminal screen                │
│ echo [text]      │ Print text to terminal               │
│ date             │ Show current date and time           │
│ hide             │ Hide terminal window                 │
│ matrix           │ Toggle matrix rain effect            │
│ color [1-5]      │ Change color theme                   │
└──────────────────┴──────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────────┐
│ <span class="accent">number</span>           │ <span class="accent">color</span>                                │
├──────────────────┼──────────────────────────────────────┤
│ 1                │ white & black                        │
│ 2                │ purple                               │
│ 3                │ red                                  │
│ 4                │ blue                                 │
│ 5                │ green                                │
└──────────────────┴──────────────────────────────────────┘

</span>`,
    neofetch: systemInfo,
    clear: function() { 
        document.getElementById('output').innerHTML = ''; 
        return ''; 
    },
    echo: function(args) { return args.join(' '); },
    date: function() { return new Date().toString(); },
    sudo: 'Permission denied (no pseudo-tty allocated)',
    matrix: function() {
        if (matrixInterval) {
            clearInterval(matrixInterval);
            matrixInterval = null;
            document.querySelectorAll('.matrix-digit').forEach(el => el.remove());
            return;
        } else {
            startMatrixEffect();
            return;
        }
    },
    hide: function() {
        document.getElementById('terminal').style.display = 'none';
        return 'Console hidden. Press Ctrl+Shift+H to show again.';
    },
    color: function(args) {
        if (!args.length) {
            return `<span style="font-family: monospace; white-space: pre;">
┌──────────────────┬──────────────────────────────────────┐
│ <span class="accent">number</span>           │ <span class="accent">color</span>                                │
├──────────────────┼──────────────────────────────────────┤
│ 1                │ white & black                        │
│ 2                │ purple                               │
│ 3                │ red                                  │
│ 4                │ blue                                 │
│ 5                │ green                                │
└──────────────────┴──────────────────────────────────────┘

</span>`;
        }
        
        const themes = {
            '1': 'bw',
            '2': 'default',
            '3': 'red',
            '4': 'blue',
            '5': 'green'
        };
        
        const themeName = themes[args[0]];
        if (!themeName) return `<span class="error">Invalid color number. Available: 1-5</span>`;
        
        applyTheme(themeName);
        return `Applied ${themeName} theme`;
    }
};

function startMatrixEffect() {
    matrixInterval = setInterval(() => {
        const digit = document.createElement('div');
        digit.className = 'matrix-digit';
        digit.textContent = Math.random() > 0.5 ? '0' : '1';
        digit.style.color = colorThemes[currentTheme].matrix;
        digit.style.left = Math.random() * window.innerWidth + 'px';
        digit.style.top = '-20px';
        document.body.appendChild(digit);
        
        animateDigit(digit);
    }, 50);
}

function animateDigit(digit) {
    let pos = -20;
    const speed = 2 + Math.random() * 3;
    const interval = setInterval(() => {
        pos += speed;
        digit.style.top = pos + 'px';
        
        if (pos > window.innerHeight) {
            clearInterval(interval);
            digit.remove();
        }
    }, 20);
}

document.getElementById('command-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const input = this.value.trim();
        this.value = '';
        
        const output = document.getElementById('output');
        const commandLine = document.createElement('div');
        commandLine.innerHTML = `<span class="prompt">user@terminal:~$</span> ${input}`;
        output.appendChild(commandLine);
        
        const [cmd, ...args] = input.split(' ');
        let response = '';
        
        if (commands[cmd]) {
            response = typeof commands[cmd] === 'function' 
                ? commands[cmd](args) 
                : commands[cmd];
        } else if (cmd) {
            response = `<span class="error">${cmd}: command not found</span>`;
        }
        
        if (response) {
            const responseLine = document.createElement('div');
            responseLine.innerHTML = response;
            output.appendChild(responseLine);
        }
        
        output.scrollTop = output.scrollHeight;
    }
});

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        const terminal = document.getElementById('terminal');
        if (terminal.style.display === 'none') {
            terminal.style.display = 'block';
            document.getElementById('command-input').focus();
        } else {
            terminal.style.display = 'none';
        }
    }
});

applyTheme(currentTheme);