cd client-portal-frontend
npm run build
Copy-Item -Recurse -Force build\* ..\portal\static\portal\react\
