const userFilter = (interaction) => {
    return (i) => i.user.id === interaction.user.id;
};
export { userFilter };
