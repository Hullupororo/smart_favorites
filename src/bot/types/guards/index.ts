import {
  DraftPayload,
  TextPayload,
  LinkPayload,
  OtherPayload,
  AlbumPayload,
  SingleMediaPayload,
  MediaKind,
} from '../payload';

export const isTextPayload = (p: DraftPayload): p is TextPayload =>
  p.kind === 'text';
export const isLinkPayload = (p: DraftPayload): p is LinkPayload =>
  p.kind === 'link';
export const isOtherPayload = (p: DraftPayload): p is OtherPayload =>
  p.kind === 'other';

export const isAlbumPayload = (p: DraftPayload): p is AlbumPayload =>
  p.kind === 'album';

export const isSingleMediaPayload = (
  p: DraftPayload,
): p is SingleMediaPayload =>
  p.kind === 'photo' || p.kind === 'video' || p.kind === 'document';

export const isMediaKind = (k: string): k is MediaKind =>
  k === 'photo' || k === 'video' || k === 'document';
