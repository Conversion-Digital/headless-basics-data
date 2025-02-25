declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}
declare module "*.png" {
  const value: any;
  export = value;
}

declare module "*.jpg" {
  const value: any;
  export = value;
}
declare module "*.jpeg" {
  const value: any;
  export = value;
}
declare module "*.webp" {
  const value: any;
  export = value;
}

declare module "*.wav" {
  const src: string;
  export default src;
}
