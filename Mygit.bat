ECHO.
ECHO ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
ECHO :: Publicando cambios en el repositorio                                 ::
ECHO ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
ECHO.
ECHO ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
ECHO :: JHONATTAN RAMIREZ SOLUCIONES SELPHIS C.A                             ::
ECHO ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
ECHO.
git rm --cached -- ./src/environments/environment.prod.ts
git rm --cached -- ./src/environments/environment.ts
git status  
git add .
git status
git commit -m %1
git push