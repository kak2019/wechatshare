export type EmbyWallItem = {
  id: string;
  name: string;
  type: string;
  year: number | null;
  overview: string | null;
  serverId: string;
  hasPrimaryImage: boolean;
  imageTag: string | null;
  openUrl: string;
  posterUrl: string | null;
};

export type EmbyPlayInfo = {
  itemId: string;
  playId: string;
  title: string;
  subtitle: string | null;
  type: string;
  streamUrl: string;
  openUrl: string;
  posterUrl: string | null;
};
