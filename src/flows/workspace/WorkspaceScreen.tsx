import { useParams } from "@tanstack/react-router";
import { WorkspacePreview } from "@/shared/ui/orchestrator/WorkspacePreview";
import {
  workspaceNavigation,
  unavailableWorkspace,
  type WorkspaceItem,
} from "../_mocks/navigation";

type Props = { items?: WorkspaceItem[] };
export default function WorkspaceScreen({
  items = workspaceNavigation,
}: Props) {
  const { section } = useParams({ strict: false });
  const item = items.find((item) => item.id === section);
  return <WorkspacePreview item={item ?? unavailableWorkspace} />;
}
