export interface IRegion{
    regionId: string;
    regionName:string;
    stations:IStation[];
}

export interface IStation{
    asciiName: string;
    href: string;
    id: string;
    logoLarge: string;
    logoMedium: string;
    logoSmall: string;
    logoXsmall: string;
    name: string;
}