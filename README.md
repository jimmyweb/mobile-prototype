Libraries used:
- Hammer.js - for touch handling
- Swipe.js - for screenshots gallery handling

Structure:
- index.html in root directory is only menu for different versions of prototype on FTP.
- Main project is in dev directory. It's done like that because img folder is shared between different versions of prototype on server (to avoid duplication) and paths point to it.

dev directory: 
- sass directory - contains of .scss files for styling (config.rb in dev root has configuration for precompilation)
- js directory - main.js with main script and plugins.js with used libraries
- root directory has 3 files: content.js, homecontent.js and searchcontent.js which are responsible for keeping content data for prototype

DON'T HESITATE TO USE THE NEWEST FEATURES OF HTML5/CSS3/JS. PROTOTYPE IS SUPPOSED TO WORK ONLY ON THE IPHONE 5 ;)