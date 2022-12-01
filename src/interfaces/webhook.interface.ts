export interface Author {
    name: string;
    icon_url: string;
    url: string;
}

export interface Thumbnail {
    url: string;
}

export interface Field {
    name: string;
    value: string;
    inline?: boolean;
}

export interface Image {
    url: string;
}

export interface Footer {
    text: string;
    icon_url: string;
}

export interface EmbedObject {
    color?: number;
    title: string;
    url?: string;
    author?: Author;
    description?: string;
    thumbnail?: Thumbnail;
    fields?: Field[];
    image?: Image;
    timestamp?: Date;
    footer?: Footer;
}

export interface Channel {
    name: string;
    id: string;
    token: string;
}
