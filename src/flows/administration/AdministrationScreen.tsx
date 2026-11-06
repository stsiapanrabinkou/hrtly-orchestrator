import { useLocation, useNavigate } from "@tanstack/react-router";
import { FlowNavigation } from "@/shared/ui/orchestrator/FlowNavigation";
import { AdministrationView } from "@/shared/ui/orchestrator/AdministrationView";
import { internalUsers, type InternalUser } from "../_mocks/workspace";
type Props = { users?: InternalUser[] };
export default function AdministrationScreen({ users = internalUsers }: Props) { const location = useLocation(); const navigate = useNavigate(); return <FlowNavigation><AdministrationView users={location.state.internalUserPreviews ?? users} onUserPreview={(next) => { void navigate({ to: "/administration", replace: true, resetScroll: false, state: { ...location.state, internalUserPreviews: next } }); }} /></FlowNavigation>; }
