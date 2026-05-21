//modules
import { input } from '@inquirer/prompts';

/**
 * Returns a list of control methods for the terminal
 */
export default function control(brand = '') {
  const controls = {
    brand,
    
    /**
     * Outputs an colorful (red) log 
     */
    error(message: string, variables: string[] = []) {
      controls.output(message, variables, '\x1b[31m%s\x1b[0m');
    },

    /**
     * Outputs an colorful (blue) log 
     */
    info(message: string, variables: string[] = []) {
      controls.output(message, variables, '\x1b[34m%s\x1b[0m');
    },

    /**
     * Asks for input
     */
    async input(question: string, answer?: string) {
      return await input({
        message: question,
        default: answer,
        required: typeof answer !== 'string'
      });
    },

    /**
     * Outputs a log 
     */
    output(
      message: string, 
      variables: string[] = [],
      color?: string
    ) {
      //add variables to message
      for (const variable of variables) {
        message = message.replace('%s', variable);
      }
      //add brand to message
      message = `${controls.brand} ${message}`.trim();
      //colorize the message
      if (color) {
        console.log(color, message);
        return;
      }
      //or just output the message
      console.log(message);
    },

    /**
     * Outputs a success log 
     */
    success(message: string, variables: string[] = []) {
      controls.output(message, variables, '\x1b[32m%s\x1b[0m');
    },

    /**
     * Outputs a system log 
     */
    system(message: string, variables: string[] = []) {
      controls.output(message, variables, '\x1b[35m%s\x1b[0m');
    },

    /**
     * Outputs a warning log 
     */
    warning(message: string, variables: string[] = []) {
      controls.output(message, variables, '\x1b[33m%s\x1b[0m');
    }
  };

  return controls;
};