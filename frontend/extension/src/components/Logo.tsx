import classNames from "classnames";
import LogoBase64 from "data-base64:../../assets/icon.png";

interface Props {
  className?: string;
}

const Logo = ({ className }: Props) => {
  return <img className={classNames("rounded-full", className)} src={LogoBase64} alt="" />;
};

export default Logo;
