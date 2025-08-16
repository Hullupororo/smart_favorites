import { Message } from 'telegraf/types';

type PhotoSize = Message.PhotoMessage['photo'][number];
type Document = Message.DocumentMessage['document'];
type Video = Message.VideoMessage['video'];

const has = <K extends string>(k: K, m?: object): m is Record<K, unknown> =>
  m ? k in m : false;

export const isTextMsg = (m?: Message): m is Message & { text: string } =>
  has('text', m);

export const isPhotoMsg = (m: Message): m is Message & { photo: PhotoSize[] } =>
  has('photo', m);

export const isDocMsg = (m: Message): m is Message & { document: Document } =>
  has('document', m);

export const isVideoMsg = (m: Message): m is Message & { video: Video } =>
  has('video', m);

export const hasCaption = (m: Message): m is Message & { caption: string } =>
  has('caption', m);

export const hasMediaGroup = (
  m: Message,
): m is Message & { media_group_id: string } => has('media_group_id', m);
