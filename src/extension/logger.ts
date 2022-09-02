class Logger {
  private static log(string: any, css: string, ...rest: any[]) {
    // eslint-disable-next-line no-console
    console.log('%c[JIRA SD Helper]', css, string, ...rest);
  }

  public static info(string: any, ...rest: any[]): void {
    const css = 'color: #0052cc';
    this.log(string, css, ...rest);
  }

  public static error(string: any, ...rest: any[]): void {
    const css = 'color: #b82206';
    this.log(string, css, ...rest);
  }
}

export default Logger;
