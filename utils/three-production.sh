export GITHUB_TOKEN=$API_TOKEN_GITHUB
mkdir output
git clone "https://$API_TOKEN_GITHUB@github.com/webaverse/three.git" output
npm pack . --pack-destination output
cd output
rm -rf $(find . -type f -name "output*.tgz")
ls -l
tar -xvzf $(find . -type f -name "*.tgz")
cp -r package/* .
rm -rf package 
rm -rf $(find . -type f -name "*.tgz")
output=$(git status --porcelain)
if [ "${#output}" -ge 5 ]; then 
    git config --global user.email "hello@webaverse.com"
    git config --global user.name "Webaverse"
    echo $secrets.WEBA_BOT_SSH_KEY
    git checkout -b threejs-bump
    git add .
    git commit -m "Bump webaverse/three.js@latest into three" -a
    git commit --message "Update from https://github.com/webaverse/three/commit/$GITHUB_SHA" --allow-empty
    echo "Pushing git commit"
    git push -f -u origin HEAD:$INPUT_DESTINATION_HEAD_BRANCH
    echo "Creating a pull request"
    gh pr create -t $INPUT_DESTINATION_HEAD_BRANCH \
                -b $INPUT_DESTINATION_HEAD_BRANCH \
                -B $INPUT_DESTINATION_BASE_BRANCH \
                -H $INPUT_DESTINATION_HEAD_BRANCH
                    # $PULL_REQUEST_REVIEWERS
fi
cd ..