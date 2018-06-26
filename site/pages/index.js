export default {
  //url读key
  documents: {
    'quick-start': require('./quickStart'),
    'changelog': require('./changelog'),
    'contributing': require('./contributing'),
    'resource': require('./resource'),
    'customTheme': require('./customTheme'),
  },
  components: {
    '通用组件': {
      'animationImageLoader': require('./animationImageLoader'),
      'loading': require('./loading'),
      'button': require('./button'),
    }
  }
};
