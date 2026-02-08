import { getBoardsList } from "@/lib/actions/boards";
import BoardsListContent from "./boards-list-content";

export default async function BoardsListPage() {
  const { boards } = await getBoardsList();
  return <BoardsListContent initialBoards={boards} />;
}
