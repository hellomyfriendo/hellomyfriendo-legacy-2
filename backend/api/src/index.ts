import {createApp} from './app';
import {config} from './config';

createApp().then(({app, logger}) => {
  app.listen(config.port, () => {
    logger.info(
      `${config.service.name} server listening on port ${config.port}`
    );
  });
});
