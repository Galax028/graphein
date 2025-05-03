interface MaterialIconProps {
  icon: string;
}

const MaterialIcon = ({ icon }:MaterialIconProps) => {
  return (
    <i className="material-symbols-outlined">{icon}</i>
  )
}

export default MaterialIcon;