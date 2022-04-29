# 持续集成和发布

## 持续集成

持续集成脚本见`.github/workflows/cd.yml`，功能是每次merge时自动执行构建，将结果上传到oss和npm仓库。

oss上的文件名是`three-$commit_id.js`。

npm上的版本号是`$current_version-$commit_id`。

oss和npm的相关token存储在仓库[Secrets](https://github.com/oppenfuture/three.js/settings/secrets/actions)中。

注意如果更换了开发分支需要对应修改脚本中的分支名。

## 发布

发布脚本见`.github/workflows/release.yml`，只能手动触发，触发时执行构建，将构建结果提交到仓库当前分支，并上传到oss和npm仓库。

提交功能需要`GitHub personal access token`，需要由有仓库写权限的人[创建](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)，并加入[Secrets](https://github.com/oppenfuture/three.js/settings/secrets/actions)。

发布之前，在本地仓库运行

```bash
npm version $new_version
```

push到远程仓库后执行workflow即可。

oss上的文件名是`three-$current_version.js`。

npm上的版本号是`$current_version`。
