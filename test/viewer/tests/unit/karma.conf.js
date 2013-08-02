basePath = "../../"

files = [
  JASMINE,
  JASMINE_ADAPTER,

  'libs/angular.js',
  'libs/angular-mocks.js',
  'libs/underscore-min.js',
  'libs/coffee-script.js',

  'app/app.coffee',
  'app/filters.coffee',
  'app/services.coffee',
  'app/directives.coffee',
  'app/controllers.coffee',

  'tests/unit/*coffee'
];

preprocessors = {
  '**/*.coffee': 'coffee'
};

reporters = [
  "progress"
];

autoWatch = true;
singleRun = false;
