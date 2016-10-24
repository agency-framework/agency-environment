# Environment
[![NPM version](https://badge.fury.io/gh/StephanGerbeth%2Fagency-environment.svg)](https://badge.fury.io/gh/StephanGerbeth%2Fagency-environment)
[![Build Status](https://img.shields.io/travis/StephanGerbeth/agency-environment.svg?style=flat&label=Linux%20build)](https://travis-ci.org/StephanGerbeth/agency-environment)
[![Windows Build status](https://img.shields.io/appveyor/ci/StephanGerbeth/agency-environment.svg?style=flat&label=Windows%20build)](https://ci.appveyor.com/project/StephanGerbeth/agency-environment)
[![Dependency Status](https://img.shields.io/david/StephanGerbeth/agency-environment.svg?style=flat)](https://david-dm.org/StephanGerbeth/agency-environment)
[![devDependency Status](https://img.shields.io/david/dev/StephanGerbeth/agency-environment.svg?style=flat)](https://david-dm.org/StephanGerbeth/agency-environment#info=devDependencies)

---

### Default Configuration's

#### Zip-Compress

```json
...
"zipcompress": {
  "subtasks": [{
    "name": "default",
    "excludes": [],
    "files": {
      "src": ["<%= destination %>"],
      "dest": "<%= destination %>"
    }
  }]
},
...
```
##### excludes
List of path's to exclude from compress.

#### Export-HBS

```json
...
"exporthbs": {
  "subtasks": [{
    "name": "default",
    "files": {
      "src": ["./src/tmpl/partials/**/*.hbs"],
      "dest": "<%= destination %>/hbs"
    }
  }, {
    "name": "packages",
    "files": {
      "src": [],
      "dest": "<%= destination %>/hbs"
    },
    "options": {
      "base": "./node_modules"
    }
  }]
},
...
```
