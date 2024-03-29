export default function CatalogTypeName(props) {
    switch (props.type) {
    case 1:
    case "abstract":
        return "Group/family/class";
    case 2:
    case "physical":
        return "Physical item";
    case 3:
    case "kit":
        return "Kit";
    case 4:
    case "bits":
        return "Software/data/text without storage media";
    case 5:
        case "company":
            return "Company/Individual creator";
    default:
        throw new Error("Invalid catalog type error");
    }
}
