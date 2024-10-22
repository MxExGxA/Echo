import logoImage from "@/assets/images/logo.svg";

const Navbar = () => {
  return (
    <div className="py-10 px-[5%] absolute left-0 top-0 z-10 pointer-events-none">
      <img src={logoImage} width={120} alt="logo" />
    </div>
  );
};

export default Navbar;
