# MAINTAINER'S GUIDE

## Gitflow

* `main`: branch is used for production releases.
* `beta`: branch is used for beta testing. It is gathering all the code from bug fixes and new features.
* `chore/*`: documentation updates, and maintenance tasks.
* `feature/*`: new features.
* `fix/*`: bug fixes.

## Versioning

We use semantic versioning.

### Beta versions

Before we release a new version, we first release one or more series of `beta` versions.

For example if the current production version is 1.0.1, and we want to move on with releasing 1.0.2, first we release 1.0.2-beta.1, 1.0.2-beta.2, etc. until we are confident that the new version is stable.

To release a beta:
1. Update the CHANGELOG.md file with the latest beta version and release date of the version.
2. bump the version in `package.json>version` with `yarn bump:beta`
3. Push the changes to the `beta` branch.
4. Then release by triggering the GitHub Actions workflow `Publish Beta Package` on the `beta` branch.

## Production releases

When we are confident that the beta version is stable, we release a production version.

1. In `beta` branch bump the version in `package.json>version` to the new version with `yarn bump:release` (or manually).
2. Update the CHANGELOG.md file with the new version and release date of the version. The changes that were previously in beta should be moved to the new version.
3. Push the changes to beta.
4. Create a PR and merge `beta` to `main`.
5. Then release by triggering the Github action `Publish Production Package` on `main` branch.


> Note: The Github actions need approval to be launched. If you're part of the admins team, you can do it yourself.


