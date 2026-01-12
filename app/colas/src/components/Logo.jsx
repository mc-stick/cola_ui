function Logo({ size = 'md', showBackground = false }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const logoImage = (
    <img 
      src="../assets/logoUCNE.png" 
      alt="Logo Empresa" 
      className={`${sizes[size]} object-contain`}
    />
  );

  if (showBackground) {
    return (
      <div className="bg-white rounded-lg p-2 shadow-md">
        {logoImage}
      </div>
    );
  }

  return logoImage;
}

export default Logo;