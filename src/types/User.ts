
export type User = {
    id: string;
    name: string;
    email: string;
    roles: string[];
    videoStream?: MediaStream | null;
    colyseusId?: string;
}