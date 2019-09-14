# azure-nodejs-explore-api-app
Web app for exploration of Azure APIs

Use this repo as a starting point for your experiments with Azure Services in Node.JS

## Mirror this repo into a new repo

1. Open Git Bash.

2. Create a bare clone of this repository.
```
$ git clone --bare https://github.com/vparfenovAtGoogle/azure-nodejs-explore-api-app.git
```
3. Mirror-push to the your own new repository.
```
$ cd azure-nodejs-explore-api-app.git
$ git push --mirror https://github.com/yourusername/your-repository-name.git
```
4. Remove the temporary local repository you created in step 1.
```
$ cd ..
$ rm -rf azure-nodejs-explore-api-app.git
```
