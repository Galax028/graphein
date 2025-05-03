import Image from "next/image";

const PersonAvatar = () => {
  return (
    <div className="rounded-full w-8 h-8 aspect-square overflow-hidden">
      <Image
        src={"/images/common/test/avatar-test-student.png"}
        width={32}
        height={32}
        alt="Avatar"
        className="aspect-square w-full h-full object-cover"
      />
    </div>
  );
};

export default PersonAvatar;
