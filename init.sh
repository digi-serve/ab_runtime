if [[ ! -f ./.env ]]; then
   cp ./example.env .env
   echo "Please configure your parameters in the .env file."
fi
git submodule init && git submodule update
for dir in "." $(git submodule | awk '{print $2}'); do
   (
      if [[ -f ./$dir/package.json ]]; then
         npm install --prefix ./$dir -f
      fi
   ) &
done
wait
