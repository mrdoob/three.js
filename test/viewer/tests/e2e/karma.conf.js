basePath = "../../"

files = [
  JASMINE,
  JASMINE_ADAPTER,

  'libs/angular.js',
  'libs/underscore',
  'libs/coffee',

  'app/app.coffee',
  'app/filters.coffee',
  'app/services.coffee',
  'app/directives.coffee',
  'app/controllers.coffee',

  'test/unit/*coffee'
];

preprocessors = {
  '**/*.coffee': 'coffee'
};

reporters = [
  "progress"
];

autoWatch = true;
singleRun = false;
