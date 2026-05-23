export interface TeamProfile {
  id: string;
  userId: string | null;
  name: string;
  roleTitle: string;
  photoUrl: string | null;
  bioMd: string | null;
  stackTags: string[] | null;
  linkedin: string | null;
  github: string | null;
  startDate: string | null;
}
