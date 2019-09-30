# DEVELOPMENT NOTES

## archiving old versions

(hopefully automated someday)

1. make repo on github
2. in threejsfundamentals.org
   1. git fetch origin gh-pages
   2. git checkout gh-pages
   3. git rebase origin/gh-pages?
   4. git clone --branch gh-pages ../old.threejsfundamentals/rXXX
3. cd ../old.threejsfundamentals.rXXX
4. git remote rm origin
5. git remote add origin <new-github-repo>
6. edit CNAME
7. delete 
   * robots.txt
   * sitemap.xml
   * atom.xml
   * Gruntfile.js
8. s/\/threejsfundamentals.org/\/rXXX.threejsfundamentals.org/g
9. git push -u origin gh-pages
10. Update DNS (cloudflare)
