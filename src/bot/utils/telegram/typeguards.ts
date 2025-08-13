import { Message } from 'telegraf/types';

export const isText = (m?: Message): m is Message.TextMessage =>
  m ? 'text' in m : false;
export const isPhoto = (m: Message): m is Message.PhotoMessage => 'photo' in m;
export const isDocument = (m: Message): m is Message.DocumentMessage =>
  'document' in m;
export const isVideo = (m: Message): m is Message.VideoMessage => 'video' in m;
